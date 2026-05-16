/**
 * Seed heritage walks from Visit Sarajevo content.
 * Run: node --env-file=backend/.env --import tsx backend/src/scripts/seedHeritageWalks.ts
 */
import { requestSupabaseAdminJson, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';

interface Walk {
  slug: string;
  title_bs: string;
  title_en: string;
  description_bs: string;
  description_en: string;
  estimated_minutes: number;
  distance_km: number;
  difficulty: string;
  sort_order: number;
}

interface Stop {
  walkSlug: string;
  sort_order: number;
  title_bs: string;
  title_en: string;
  description_bs: string;
  description_en: string;
  what_to_look_for_bs: string;
  what_to_look_for_en: string;
  walking_minutes_to_next: number;
  latitude: number;
  longitude: number;
  venueSearch: string; // name to search in venues table
}

const WALKS: Walk[] = [
  {
    slug: 'ottoman-sarajevo',
    title_bs: 'Osmansko Sarajevo',
    title_en: 'Ottoman Sarajevo',
    description_bs: 'Prošetajte kroz pet vijekova osmanske historije — od Sebilj fontane do skrivenih hanova i bezistana.',
    description_en: 'Walk through five centuries of Ottoman history — from the Sebilj fountain to hidden hans and covered bazaars.',
    estimated_minutes: 75,
    distance_km: 1.5,
    difficulty: 'easy',
    sort_order: 1,
  },
  {
    slug: 'austro-hungarian-sarajevo',
    title_bs: 'Austrougarsko Sarajevo',
    title_en: 'Austro-Hungarian Sarajevo',
    description_bs: 'Od Vijećnice do Vječnog plamena — otkrijte kako je Austro-Ugarska preobrazila grad za samo 40 godina.',
    description_en: 'From City Hall to the Eternal Flame — discover how Austria-Hungary transformed the city in just 40 years.',
    estimated_minutes: 60,
    distance_km: 1.8,
    difficulty: 'easy',
    sort_order: 2,
  },
  {
    slug: 'european-jerusalem',
    title_bs: 'Evropski Jeruzalem',
    title_en: 'European Jerusalem',
    description_bs: 'Džamija, sinagoga, pravoslavna i katolička katedrala — sve na pješačkoj udaljenosti. Jedinstven suživot vjera.',
    description_en: 'Mosque, synagogue, Orthodox and Catholic cathedral — all within walking distance. A unique coexistence of faiths.',
    estimated_minutes: 50,
    distance_km: 1.0,
    difficulty: 'easy',
    sort_order: 3,
  },
];

const STOPS: Stop[] = [
  // --- Ottoman Sarajevo ---
  {
    walkSlug: 'ottoman-sarajevo',
    sort_order: 1,
    title_bs: 'Sebilj fontana',
    title_en: 'Sebilj Fountain',
    description_bs: 'Drvena fontana iz 1753. na Baščaršiji. Ko god popije vode sa sarajevskih česama — vratiće se u Sarajevo.',
    description_en: 'Wooden fountain from 1753 on Baščaršija square. Whoever drinks water from Sarajevo\'s fountains will return to Sarajevo.',
    what_to_look_for_bs: 'Pogledaj golubove oko fontane i zanatske radnje iza. Posmatraj kaldrmu — original iz osmanskog perioda.',
    what_to_look_for_en: 'Watch the pigeons around the fountain and craft shops behind. Notice the cobblestones — original from the Ottoman period.',
    walking_minutes_to_next: 3,
    latitude: 43.8598,
    longitude: 18.4310,
    venueSearch: 'Sebilj',
  },
  {
    walkSlug: 'ottoman-sarajevo',
    sort_order: 2,
    title_bs: 'Gazi Husrev-begova džamija',
    title_en: 'Gazi Husrev-bey Mosque',
    description_bs: 'Najznačajnija džamija na Balkanu, izgrađena 1531. Kompleks je uključivao medresu, biblioteku, hamam i sahat-kulu.',
    description_en: 'The most significant mosque in the Balkans, built in 1531. The complex included a madrasa, library, hammam, and clock tower.',
    what_to_look_for_bs: 'Pogledaj sahat-kulu — jedinu u svijetu koja još radi po lunarnom kalendaru. Obrati pažnju na šadrvan u dvorištu.',
    what_to_look_for_en: 'Look at the clock tower — the only one in the world still operating on a lunar calendar. Notice the fountain in the courtyard.',
    walking_minutes_to_next: 2,
    latitude: 43.8600,
    longitude: 18.4315,
    venueSearch: 'Gazi Husrev',
  },
  {
    walkSlug: 'ottoman-sarajevo',
    sort_order: 3,
    title_bs: 'Morića Han',
    title_en: 'Morića Han',
    description_bs: 'Jedini preostali han u Sarajevu, iz 17. vijeka. Nekada konak za trgovce i putnike, danas kafana sa autentičnim ambijentom.',
    description_en: 'The only remaining han (inn) in Sarajevo, from the 17th century. Once lodging for merchants and travelers, now a cafe with authentic atmosphere.',
    what_to_look_for_bs: 'Uđi u unutrašnje dvorište — originalna osmanska arhitektura. Popij kafu ovdje, skuhana je na tradicionan način.',
    what_to_look_for_en: 'Enter the inner courtyard — original Ottoman architecture. Have coffee here, it\'s prepared the traditional way.',
    walking_minutes_to_next: 3,
    latitude: 43.8594,
    longitude: 18.4305,
    venueSearch: 'Morića Han',
  },
  {
    walkSlug: 'ottoman-sarajevo',
    sort_order: 4,
    title_bs: 'Brusa bezistan',
    title_en: 'Brusa Bezistan',
    description_bs: 'Natkrivena tržnica iz 1551. koju je sagradio Rustem-paša. Danas muzej sa eksponatima iz svih perioda sarajevske historije.',
    description_en: 'Covered market from 1551 built by Rustem Pasha. Now a museum with exhibits from all periods of Sarajevo\'s history.',
    what_to_look_for_bs: 'Obrati pažnju na kupole — svaka je iznad jedne trgovačke ćelije. Pogledaj arheološke nalaze iz rimskog i ilirskog perioda.',
    what_to_look_for_en: 'Notice the domes — each covers one trading cell. Look at the archaeological finds from the Roman and Illyrian periods.',
    walking_minutes_to_next: 5,
    latitude: 43.8590,
    longitude: 18.4298,
    venueSearch: 'Brusa',
  },
  {
    walkSlug: 'ottoman-sarajevo',
    sort_order: 5,
    title_bs: 'Baščaršija — šetnja čaršijom',
    title_en: 'Baščaršija — Market Walk',
    description_bs: 'Do 16. vijeka čaršija je imala 45 tržnica i preko 80 zanata. Kazandžiluk (bakrači), ćurčiluk (kožni radovi), sarajlije zanatlije.',
    description_en: 'By the 16th century the market had 45 bazaars and over 80 crafts. Coppersmith alley, leather works, Sarajevo artisans.',
    what_to_look_for_bs: 'Kazandžiluk ulica — slušaj zvuk čekića na bakru. Svaki predmet ručno rađen. Kupite mali fildžan kao suvenir.',
    what_to_look_for_en: 'Coppersmith street — listen to the sound of hammers on copper. Every item handmade. Buy a small coffee cup as a souvenir.',
    walking_minutes_to_next: 0,
    latitude: 43.8596,
    longitude: 18.4312,
    venueSearch: 'Baščaršija',
  },

  // --- Austro-Hungarian Sarajevo ---
  {
    walkSlug: 'austro-hungarian-sarajevo',
    sort_order: 1,
    title_bs: 'Vijećnica (Gradska vijećnica)',
    title_en: 'City Hall (Vijećnica)',
    description_bs: 'Završena 1896. u pseudo-maurskom stilu. Jedan od najskupljih projekata Monarhije. Oštećena u opsadi, obnovljena 2014.',
    description_en: 'Completed in 1896 in pseudo-Moorish style. One of the Empire\'s most expensive projects. Damaged in the siege, restored in 2014.',
    what_to_look_for_bs: 'Pogledaj staklenu kupolu iznutra — dodana zbog problema sa osvjetljenjem. Obrati pažnju na detalje fasade — svaki je ručno rađen.',
    what_to_look_for_en: 'Look at the glass dome from inside — added to solve the lighting problem. Notice the facade details — each one handmade.',
    walking_minutes_to_next: 3,
    latitude: 43.8590,
    longitude: 18.4340,
    venueSearch: 'Vijećnica',
  },
  {
    walkSlug: 'austro-hungarian-sarajevo',
    sort_order: 2,
    title_bs: 'Latinski most i Muzej atentata',
    title_en: 'Latin Bridge & Assassination Museum',
    description_bs: 'Na ovom mjestu je 28. juna 1914. izvršen atentat na nadvojvodu Franca Ferdinanda — događaj koji je pokrenuo Prvi svjetski rat.',
    description_en: 'At this location on June 28, 1914, Archduke Franz Ferdinand was assassinated — the event that triggered World War I.',
    what_to_look_for_bs: 'Stani na ugao — tačno mjesto gdje je Princip stajao. Muzej je mali ali sadržajan. Pogledaj originalne fotografije iz tog dana.',
    what_to_look_for_en: 'Stand on the corner — the exact spot where Princip stood. The museum is small but rich. Look at the original photographs from that day.',
    walking_minutes_to_next: 5,
    latitude: 43.8576,
    longitude: 18.4285,
    venueSearch: 'Latin',
  },
  {
    walkSlug: 'austro-hungarian-sarajevo',
    sort_order: 3,
    title_bs: 'Katedrala Srca Isusova',
    title_en: 'Sacred Heart Cathedral',
    description_bs: 'Katolička katedrala izgrađena 1889. po projektu Josipa Vancaša. Neogotski stil sa elementima romanike.',
    description_en: 'Catholic cathedral built in 1889 by Josip Vancaš. Neo-Gothic style with Romanesque elements.',
    what_to_look_for_bs: 'Dva zvonika dominiraju horizontom. Obrati pažnju na vitraže — svaki priča biblijsku priču.',
    what_to_look_for_en: 'Two bell towers dominate the skyline. Notice the stained glass windows — each tells a biblical story.',
    walking_minutes_to_next: 5,
    latitude: 43.8585,
    longitude: 18.4250,
    venueSearch: 'Katedrala',
  },
  {
    walkSlug: 'austro-hungarian-sarajevo',
    sort_order: 4,
    title_bs: 'Narodno pozorište',
    title_en: 'National Theatre',
    description_bs: 'Otvoreno 1921, izgrađeno u neoklasičnom stilu. Centralna pozornica za operu, balet i dramu u Sarajevu.',
    description_en: 'Opened in 1921, built in neoclassical style. The central stage for opera, ballet, and drama in Sarajevo.',
    what_to_look_for_bs: 'Pogledaj fasadu — simetrija i klasični stubovi. Ako je otvoreno, zaviriti u foaje — lusteri su originalni.',
    what_to_look_for_en: 'Look at the facade — symmetry and classical columns. If open, peek into the foyer — the chandeliers are original.',
    walking_minutes_to_next: 3,
    latitude: 43.8568,
    longitude: 18.4190,
    venueSearch: 'Narodno pozorište',
  },
  {
    walkSlug: 'austro-hungarian-sarajevo',
    sort_order: 5,
    title_bs: 'Vječni plamen',
    title_en: 'Eternal Flame',
    description_bs: 'Memorijal posvećen žrtvama Drugog svjetskog rata. Plamen gori neprekidno od 6. aprila 1946.',
    description_en: 'Memorial dedicated to the victims of World War II. The flame has been burning continuously since April 6, 1946.',
    what_to_look_for_bs: 'Stani i posmatraj plamen — gori neprekidno 80 godina. Obrati pažnju na natpis u kamenu.',
    what_to_look_for_en: 'Stop and watch the flame — it has been burning continuously for 80 years. Notice the inscription in stone.',
    walking_minutes_to_next: 0,
    latitude: 43.8562,
    longitude: 18.4175,
    venueSearch: 'Vječni plamen',
  },

  // --- European Jerusalem ---
  {
    walkSlug: 'european-jerusalem',
    sort_order: 1,
    title_bs: 'Stara pravoslavna crkva',
    title_en: 'Old Orthodox Church',
    description_bs: 'Jedna od najstarijih crkava u Sarajevu, iz 16. vijeka. Muzej ikona i crkvene umjetnosti.',
    description_en: 'One of the oldest churches in Sarajevo, from the 16th century. Museum of icons and church art.',
    what_to_look_for_bs: 'Zbirka ikona je jedna od najvrijednijih na Balkanu. Obrati pažnju na ikonostas i freske.',
    what_to_look_for_en: 'The icon collection is one of the most valuable in the Balkans. Notice the iconostasis and frescoes.',
    walking_minutes_to_next: 3,
    latitude: 43.8588,
    longitude: 18.4290,
    venueSearch: 'Pravoslavna',
  },
  {
    walkSlug: 'european-jerusalem',
    sort_order: 2,
    title_bs: 'Sefardski hram (Muzej Jevreja)',
    title_en: 'Sephardic Temple (Jewish Museum)',
    description_bs: 'Najstarija sinagoga na Balkanu, iz 1581. Danas muzej koji dokumentira historiju jevrejske zajednice u BiH.',
    description_en: 'The oldest synagogue in the Balkans, from 1581. Now a museum documenting the history of the Jewish community in BiH.',
    what_to_look_for_bs: 'Sarajevska hagada — jedna od najstarijih ilustriranih hagada na svijetu. Pogledaj eksponate o Sefardima u Sarajevu.',
    what_to_look_for_en: 'The Sarajevo Haggadah — one of the oldest illustrated haggadahs in the world. See exhibits about Sephardic Jews in Sarajevo.',
    walking_minutes_to_next: 4,
    latitude: 43.8584,
    longitude: 18.4270,
    venueSearch: 'Jevrej',
  },
  {
    walkSlug: 'european-jerusalem',
    sort_order: 3,
    title_bs: 'Gazi Husrev-begova džamija',
    title_en: 'Gazi Husrev-bey Mosque',
    description_bs: 'Centralna džamija Sarajeva od 1531. Monumentalan kompleks sa medresom, bibliotekom i sahat-kulom.',
    description_en: 'Central mosque of Sarajevo since 1531. Monumental complex with madrasa, library, and clock tower.',
    what_to_look_for_bs: 'Kupola i minareti dominiraju starim gradom. Obrati pažnju na kaligrafiju unutar džamije.',
    what_to_look_for_en: 'The dome and minarets dominate the old town. Notice the calligraphy inside the mosque.',
    walking_minutes_to_next: 5,
    latitude: 43.8600,
    longitude: 18.4315,
    venueSearch: 'Gazi Husrev',
  },
  {
    walkSlug: 'european-jerusalem',
    sort_order: 4,
    title_bs: 'Katedrala Srca Isusova',
    title_en: 'Sacred Heart Cathedral',
    description_bs: 'Najveća katolička katedrala u BiH. Dva zvonika i neogotska fasada — simbol austrougarske epohe.',
    description_en: 'The largest Catholic cathedral in BiH. Two bell towers and neo-Gothic facade — a symbol of the Austro-Hungarian era.',
    what_to_look_for_bs: 'Sa ovog trga možeš vidjeti i džamiju i katedralu — to je suština Evropskog Jeruzalema.',
    what_to_look_for_en: 'From this square you can see both the mosque and the cathedral — that is the essence of European Jerusalem.',
    walking_minutes_to_next: 3,
    latitude: 43.8585,
    longitude: 18.4250,
    venueSearch: 'Katedrala',
  },
  {
    walkSlug: 'european-jerusalem',
    sort_order: 5,
    title_bs: 'Saborna crkva Presvete Bogorodice',
    title_en: 'Cathedral of the Holy Mother of God',
    description_bs: 'Srpska pravoslavna katedrala izgrađena 1872. Kombinacija vizantijskog i baroknog stila.',
    description_en: 'Serbian Orthodox cathedral built in 1872. A combination of Byzantine and Baroque styles.',
    what_to_look_for_bs: 'Ikonostas od rezbarenog drveta je remek-djelo. Obrati pažnju na zvona — tri različite veličine.',
    what_to_look_for_en: 'The iconostasis of carved wood is a masterpiece. Notice the bells — three different sizes.',
    walking_minutes_to_next: 0,
    latitude: 43.8572,
    longitude: 18.4235,
    venueSearch: 'Saborna',
  },
];

async function findVenueByName(search: string): Promise<string | null> {
  const encoded = encodeURIComponent(`%${search}%`);
  const res = await requestSupabaseAdminJson(
    `/rest/v1/venues?name=ilike.${encoded}&select=id,name&limit=1`
  );
  if (res && Array.isArray(res) && res.length > 0) {
    console.log(`  ✓ Matched venue: "${res[0].name}" for search "${search}"`);
    return res[0].id;
  }
  console.log(`  ✗ No venue match for "${search}"`);
  return null;
}

async function main() {
  console.log('=== Seeding Heritage Walks ===\n');

  // 1. Insert walks (upsert on slug)
  for (const walk of WALKS) {
    console.log(`Inserting walk: ${walk.title_en}`);
    await requestSupabaseAdminNoContent('/rest/v1/heritage_walks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(walk),
    });
  }

  // 2. Get walk IDs by slug
  const walksRes = await requestSupabaseAdminJson('/rest/v1/heritage_walks?select=id,slug');
  const walkMap: Record<string, string> = {};
  for (const w of walksRes as { id: string; slug: string }[]) {
    walkMap[w.slug] = w.id;
  }
  console.log(`\nWalk IDs:`, walkMap);

  // 3. Insert stops
  for (const stop of STOPS) {
    const walkId = walkMap[stop.walkSlug];
    if (!walkId) {
      console.log(`  ✗ No walk found for slug "${stop.walkSlug}"`);
      continue;
    }

    console.log(`\nInserting stop: ${stop.title_en} (walk: ${stop.walkSlug})`);
    const venueId = await findVenueByName(stop.venueSearch);

    await requestSupabaseAdminNoContent('/rest/v1/heritage_walk_stops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walk_id: walkId,
        venue_id: venueId,
        sort_order: stop.sort_order,
        title_bs: stop.title_bs,
        title_en: stop.title_en,
        description_bs: stop.description_bs,
        description_en: stop.description_en,
        what_to_look_for_bs: stop.what_to_look_for_bs,
        what_to_look_for_en: stop.what_to_look_for_en,
        walking_minutes_to_next: stop.walking_minutes_to_next,
        latitude: stop.latitude,
        longitude: stop.longitude,
        source_attribution: 'Visit Sarajevo',
      }),
    });
  }

  console.log('\n=== Heritage walks seeded! ===');
}

main().catch(console.error);
