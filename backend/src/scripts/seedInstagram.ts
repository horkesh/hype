/**
 * seedInstagram.ts
 *
 * Manual Instagram caption seeder for demo purposes.
 * Sends 2 realistic demo captions through the parse-instagram edge function
 * to populate raw_events with pending event records.
 *
 * Usage: tsx backend/src/scripts/seedInstagram.ts
 */

import { requireSupabaseAdminConfig } from '../lib/supabaseAdmin.js';

interface ParseInstagramPayload {
  caption: string;
  account_name: string;
  post_url?: string;
}

interface ParseInstagramResult {
  is_event: boolean;
  title: string | null;
  date: string | null;
  time: string | null;
  venue_name: string | null;
  price: string | null;
  description_bs: string | null;
  description_en: string | null;
  moods: string[];
  category: string | null;
  confidence: 'high' | 'medium' | 'low';
}

const DEMO_CAPTIONS: ParseInstagramPayload[] = [
  {
    caption: `Večeras vas pozivamo na posebnu muzičku večer! 🎶

Jazz & Soul Night @ Hacienda
📅 Petak, 21. marta 2026.
🕗 21:00
🎟 Ulaz: 10 KM

Naši gosti izvođači donose toplu atmosferu direktno u srce Baščaršije. Rezervišite vaše mjesto na vreme — kapacitet je ograničen!

#Sarajevo #Jazz #NightOut #Hacienda #Bascarsija`,
    account_name: 'hacienda_sarajevo',
    post_url: 'https://www.instagram.com/p/demo_jazz_night/',
  },
  {
    caption: `Rooftop party is back! ☀️🍹

Summer Kickoff — Rooftop Sessions
📍 Hotel Europe Sky Bar, Sarajevo
📅 Subota, 22. marta 2026.
🕘 22:00 – 04:00
🎟 Free entry before 23:00 / 15 KM after

DJ lineup: Selma K. b2b Ado Flow
Dress code: Smart casual

Kapacitet je ograničen — dolazite ranije!
Link u biju za rezervacije.

#Sarajevo #Rooftop #SummerVibes #HotelEurope #DJ`,
    account_name: 'hoteleuropesarajevo',
    post_url: 'https://www.instagram.com/p/demo_rooftop_party/',
  },
];

async function parseInstagramCaption(payload: ParseInstagramPayload): Promise<ParseInstagramResult> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();

  const res = await fetch(`${supabaseUrl}/functions/v1/parse-instagram`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Edge function returned ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { success: boolean; error?: string; data: unknown };
  if (!json.success) {
    throw new Error(json.error ?? 'Unknown error from parse-instagram');
  }

  return json.data as ParseInstagramResult;
}

async function main() {
  console.log(`Seeding ${DEMO_CAPTIONS.length} demo Instagram captions...\n`);

  for (const caption of DEMO_CAPTIONS) {
    try {
      console.log(`Processing @${caption.account_name}...`);
      const result = await parseInstagramCaption(caption);

      if (result.is_event) {
        console.log(`  [event detected] "${result.title}" on ${result.date ?? 'unknown date'} (confidence: ${result.confidence})`);
        if (result.venue_name) console.log(`  [venue] ${result.venue_name}`);
        console.log(`  -> Inserted into raw_events (status: pending)`);
      } else {
        console.log(`  [not an event] confidence: ${result.confidence}`);
      }
    } catch (err) {
      console.error(`  [error] @${caption.account_name}:`, err);
    }
    console.log();
  }

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
