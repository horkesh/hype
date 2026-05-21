/**
 * dedupeExistingEvents.ts
 *
 * One-shot cleanup: scans the canonical events table for clusters of rows
 * that the new fuzzyEventsMatch predicate considers duplicates, merges each
 * cluster into its richest row (most non-null fields), and deletes the
 * others.
 *
 * Idempotent — running it twice is a no-op once everything is merged.
 *
 * Usage:
 *   tsx backend/src/scripts/dedupeExistingEvents.ts            # dry-run by default
 *   tsx backend/src/scripts/dedupeExistingEvents.ts --apply    # actually write
 */

import {
  fetchSupabaseAdminJson,
  requestSupabaseAdminNoContent,
} from '../lib/supabaseAdmin.js';
import {
  fuzzyCrossSourceKeys,
  fuzzyEventsMatch,
} from '../services/eventDedupe.js';

interface EventRow {
  id: string;
  title_bs: string | null;
  start_datetime: string | null;
  venue_id: string | null;
  location_name: string | null;
  ticket_url: string | null;
  cover_image_url: string | null;
  description_bs: string | null;
  source: string | null;
  is_active: boolean;
  type: 'venue_linked' | 'standalone' | null;
}

const APPLY = process.argv.includes('--apply');

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// Richness score — higher = more fields populated. Tie-break by earliest
// created_at if we ever load it; for now ties resolved by id (stable).
function richness(row: EventRow): number {
  let score = 0;
  if (row.venue_id) score += 3;          // venue_id worth more than locationName
  if (row.ticket_url) score += 2;
  if (row.cover_image_url) score += 2;
  if (row.location_name) score += 1;
  if (row.description_bs) score += 1;
  // Time-of-day richer than midnight
  if (row.start_datetime && !/T00:00:00(?:\.000)?Z?$/.test(row.start_datetime)) score += 2;
  // Prefer active rows as survivors — losing the visible one to a dead sibling
  // is the only way this cleanup can do real damage.
  if (row.is_active) score += 5;
  return score;
}

function isMidnight(iso: string | null): boolean {
  return !!iso && /T00:00:00(?:\.000)?Z?$/.test(iso);
}

// Build the merge patch from sources into survivor. Same rules as
// promoteEvents.buildMergePatch but operating on a full row.
function buildClusterPatch(survivor: EventRow, others: EventRow[]): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  const pick = <K extends keyof EventRow>(field: K, current: EventRow[K]): EventRow[K] => {
    if (current) return current;
    for (const o of others) {
      const v = o[field];
      if (v) return v;
    }
    return current;
  };
  const newVenueId = pick('venue_id', survivor.venue_id);
  if (newVenueId !== survivor.venue_id) {
    patch.venue_id = newVenueId;
    patch.type = 'venue_linked';
  }
  const newLocation = pick('location_name', survivor.location_name);
  if (newLocation !== survivor.location_name) patch.location_name = newLocation;
  const newTicket = pick('ticket_url', survivor.ticket_url);
  if (newTicket !== survivor.ticket_url) patch.ticket_url = newTicket;
  const newCover = pick('cover_image_url', survivor.cover_image_url);
  if (newCover !== survivor.cover_image_url) patch.cover_image_url = newCover;
  const newDesc = pick('description_bs', survivor.description_bs);
  if (newDesc !== survivor.description_bs) patch.description_bs = newDesc;
  // Time upgrade: survivor at midnight, any sibling has a real time → adopt
  if (isMidnight(survivor.start_datetime)) {
    const timed = others.find((o) => !isMidnight(o.start_datetime));
    if (timed?.start_datetime) patch.start_datetime = timed.start_datetime;
  }
  // Activity upgrade: if survivor is inactive but any sibling is active,
  // the surviving row should be visible.
  if (!survivor.is_active && others.some((o) => o.is_active)) {
    patch.is_active = true;
  }
  return patch;
}

async function fetchAllEvents(): Promise<EventRow[]> {
  // Include inactive rows too — past-event dupes still clutter admin views
  // and we want one row per event regardless of active status. fuzzyEventsMatch
  // requires ±2-day proximity, so genuinely-separate occurrences won't collide.
  return fetchSupabaseAdminJson<EventRow[]>(
    '/rest/v1/events?select=id,title_bs,start_datetime,venue_id,location_name,ticket_url,cover_image_url,description_bs,source,is_active,type&order=start_datetime.asc&limit=10000',
  );
}

async function patchEvent(id: string, patch: Record<string, unknown>): Promise<void> {
  await requestSupabaseAdminNoContent(
    `/rest/v1/events?id=eq.${encodeURIComponent(id)}`,
    { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) },
  );
}

async function deleteEvent(id: string): Promise<void> {
  await requestSupabaseAdminNoContent(
    `/rest/v1/events?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal' } },
  );
}

// Build clusters using union-find over fuzzyEventsMatch.
function buildClusters(rows: EventRow[]): EventRow[][] {
  const parent = new Map<string, string>();
  rows.forEach((r) => parent.set(r.id, r.id));
  const find = (x: string): string => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)!)!);
      x = parent.get(x)!;
    }
    return x;
  };
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  // Bucket by fuzzy key (title token only) — same logic as the index in
  // promoteEvents.fetchExistingEventKeys.
  const buckets = new Map<string, EventRow[]>();
  for (const r of rows) {
    if (!r.title_bs || !r.start_datetime) continue;
    for (const key of fuzzyCrossSourceKeys({ title: r.title_bs })) {
      const arr = buckets.get(key) ?? [];
      arr.push(r);
      buckets.set(key, arr);
    }
  }

  // Within each bucket, pair-compare to union dupes.
  for (const bucket of buckets.values()) {
    if (bucket.length < 2) continue;
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i], b = bucket[j];
        if (fuzzyEventsMatch(
          { title: a.title_bs, startDatetime: a.start_datetime, venueId: a.venue_id, locationName: a.location_name },
          { title: b.title_bs, startDatetime: b.start_datetime, venueId: b.venue_id, locationName: b.location_name },
        )) {
          union(a.id, b.id);
        }
      }
    }
  }

  const groups = new Map<string, EventRow[]>();
  for (const r of rows) {
    const root = find(r.id);
    const arr = groups.get(root) ?? [];
    arr.push(r);
    groups.set(root, arr);
  }
  return [...groups.values()].filter((g) => g.length >= 2);
}

async function main() {
  log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (pass --apply to write)'}`);
  log('Loading events...');
  const rows = await fetchAllEvents();
  log(`  ${rows.length} active events loaded`);

  log('Building dedupe clusters...');
  const clusters = buildClusters(rows);
  log(`  ${clusters.length} clusters with 2+ members`);

  let merged = 0;
  let deleted = 0;

  for (const cluster of clusters) {
    cluster.sort((a, b) => richness(b) - richness(a) || a.id.localeCompare(b.id));
    const [survivor, ...others] = cluster;
    log('');
    log(`Cluster (${cluster.length} rows, survivor "${survivor.title_bs}" [${survivor.id.slice(0, 8)}] richness=${richness(survivor)}):`);
    for (const r of cluster) {
      log(`  - [${r.id.slice(0, 8)}] r=${richness(r)} venue=${r.venue_id ?? r.location_name ?? '∅'} time=${r.start_datetime?.slice(11, 16) ?? '?'} title="${r.title_bs}"`);
    }
    const patch = buildClusterPatch(survivor, others);
    if (Object.keys(patch).length > 0) {
      log(`  MERGE → ${Object.keys(patch).join(', ')}`);
      if (APPLY) await patchEvent(survivor.id, patch);
      merged++;
    } else {
      log(`  (nothing to merge into survivor)`);
    }
    for (const o of others) {
      log(`  DELETE [${o.id.slice(0, 8)}] "${o.title_bs}"`);
      if (APPLY) await deleteEvent(o.id);
      deleted++;
    }
  }

  log('');
  log('=== Cleanup complete ===');
  log(`  Clusters processed : ${clusters.length}`);
  log(`  Survivors patched  : ${merged}`);
  log(`  Rows deleted       : ${deleted}`);
  if (!APPLY) log(`\n  (dry-run — re-run with --apply to actually write)`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
