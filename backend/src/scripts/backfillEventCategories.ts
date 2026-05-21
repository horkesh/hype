/**
 * backfillEventCategories.ts
 *
 * Re-runs inferCategory() over every event in the DB. The original
 * promoteEvents pass mapped almost every rule to 'other', so the entire
 * events table needs to be re-categorized once the rules were fixed.
 *
 * Usage:
 *   tsx backend/src/scripts/backfillEventCategories.ts          # dry-run
 *   tsx backend/src/scripts/backfillEventCategories.ts --apply  # write
 */

import {
  fetchSupabaseAdminJson,
  requestSupabaseAdminNoContent,
} from '../lib/supabaseAdmin.js';
import { inferCategory } from './promoteEvents.js';

const APPLY = process.argv.includes('--apply');

interface EventRow {
  id: string;
  title_bs: string | null;
  description_bs: string | null;
  category: string;
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function main() {
  log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (pass --apply to write)'}`);
  const rows = await fetchSupabaseAdminJson<EventRow[]>(
    '/rest/v1/events?select=id,title_bs,description_bs,category&limit=10000',
  );
  log(`Loaded ${rows.length} events`);

  const changes: Array<{ id: string; before: string; after: string; title: string }> = [];
  for (const r of rows) {
    const inferred = inferCategory(r.title_bs, r.description_bs);
    if (inferred !== r.category) {
      changes.push({ id: r.id, before: r.category, after: inferred, title: r.title_bs ?? '(no title)' });
    }
  }
  log(`${changes.length} events would change category`);

  const byTransition = new Map<string, number>();
  for (const c of changes) {
    const key = `${c.before} → ${c.after}`;
    byTransition.set(key, (byTransition.get(key) ?? 0) + 1);
  }
  log('Transitions:');
  for (const [k, v] of [...byTransition.entries()].sort((a, b) => b[1] - a[1])) {
    log(`  ${k}: ${v}`);
  }
  log('');

  // Sample 12 examples per transition for spot-check
  const samplesByTransition = new Map<string, Array<{ title: string; id: string }>>();
  for (const c of changes) {
    const key = `${c.before} → ${c.after}`;
    const arr = samplesByTransition.get(key) ?? [];
    if (arr.length < 12) arr.push({ title: c.title, id: c.id });
    samplesByTransition.set(key, arr);
  }
  log('Sample titles per transition:');
  for (const [k, samples] of samplesByTransition) {
    log(`  [${k}]`);
    for (const s of samples) log(`    - ${s.title}`);
  }
  log('');

  if (!APPLY) {
    log('Dry-run — re-run with --apply to write');
    return;
  }

  // Batch PATCH per category to minimize round-trips
  const byNewCategory = new Map<string, string[]>();
  for (const c of changes) {
    const arr = byNewCategory.get(c.after) ?? [];
    arr.push(c.id);
    byNewCategory.set(c.after, arr);
  }
  for (const [newCat, ids] of byNewCategory) {
    // PostgREST supports `in.()` with comma-separated values
    const idList = ids.map((id) => `"${id}"`).join(',');
    await requestSupabaseAdminNoContent(
      `/rest/v1/events?id=in.(${encodeURIComponent(idList)})`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ category: newCat }),
      },
    );
    log(`Patched ${ids.length} events → ${newCat}`);
  }
  log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
