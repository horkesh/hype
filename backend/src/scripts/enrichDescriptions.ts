/**
 * enrichDescriptions.ts
 *
 * Calls the enrich-descriptions edge function in batches until
 * no more venues need their descriptions generated.
 *
 * Usage: tsx backend/src/scripts/enrichDescriptions.ts
 */

import { requireSupabaseAdminConfig } from '../lib/supabaseAdmin.js';

const BATCH_SIZE = 5;
const MAX_ITERATIONS = 100; // safety cap

async function callEnrichDescriptions(batchSize: number): Promise<{ enriched: number; message?: string }> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();

  const res = await fetch(`${supabaseUrl}/functions/v1/enrich-descriptions`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ batch_size: batchSize }),
  });

  if (!res.ok) {
    throw new Error(`Edge function returned ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? 'Unknown error from enrich-descriptions');
  }

  return json.data;
}

async function main() {
  console.log('Starting description enrichment loop...');
  let totalEnriched = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const result = await callEnrichDescriptions(BATCH_SIZE);
    console.log(`  Batch ${i + 1}: enriched ${result.enriched}`);
    totalEnriched += result.enriched;

    // Edge function returns message when there are no more venues
    if (result.enriched === 0 || result.message?.includes('No venues')) {
      console.log('No more venues to enrich. Done.');
      break;
    }
  }

  console.log(`\nTotal venues enriched: ${totalEnriched}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
