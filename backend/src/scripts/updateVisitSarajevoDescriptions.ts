/**
 * updateVisitSarajevoDescriptions.ts
 *
 * Updates venue descriptions for Visit Sarajevo's top 10 attractions
 * with rich, detailed content in both Bosnian and English.
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/updateVisitSarajevoDescriptions.ts
 */

import { requestSupabaseAdminJson, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';

interface Venue {
  id: string;
  name: string;
}

interface Attraction {
  name: string;
  searchTerms: string[];
  description_bs: string;
  description_en: string;
}

const ATTRACTIONS: Attraction[] = [
  {
    name: 'Baščaršija / Sebilj',
    searchTerms: ['Baščaršija', 'Sebilj'],
    description_bs:
      'Baščaršija je uspostavljena u 15. vijeku od strane Isa-bega Ishakovića i Gazi Husrev-bega. Do 16. vijeka postala je jedno od najvećih trgovačkih centara na Balkanu, sa 45 čaršija i preko 80 zanata. Sebilj fontana je izgrađena 1753. godine. Ko god popije vode sa sarajevskih česama — vratiće se u Sarajevo.',
    description_en:
      "Established in the 15th century by Isa-Bey Ishakovic and Ghazi Husrev-Bey, Baščaršija became one of the Balkans' largest trading centers by the 16th century, with 45 markets and over 80 crafts. The Sebilj Fountain was built in 1753. Whoever drinks water from Sarajevo's fountains will return to Sarajevo.",
  },
  {
    name: 'Vijećnica (City Hall)',
    searchTerms: ['Vijećnica', 'City Hall', 'Gradska vijećnica'],
    description_bs:
      'Završena 1896. godine u pseudo-maurskom stilu, po projektu arhitekte Alexandera Witteka. Jedan od najskupljih projekata Austro-Ugarske monarhije. Teško oštećena tokom opsade 1990-ih, obnovljena 2014. Staklena kupola je dodana kako bi riješila problem osvjetljenja. Simbolizira obrazovanje, nadu, umjetnost, kulturu, historiju i ljepotu.',
    description_en:
      "Completed in 1896 in pseudo-Moorish style, designed by architect Alexander Wittek. One of the Austro-Hungarian Empire's most expensive projects. Severely damaged during the 1990s siege, renovated in 2014. A glass dome was added to solve the lighting problem. It symbolizes education, hope, art, culture, history, and beauty.",
  },
  {
    name: 'Latinski most / Muzej atentata',
    searchTerms: ['Latinski', 'Latin Bridge'],
    description_bs:
      'Na ovom mjestu je Gavrilo Princip izvršio atentat na nadvojvodu Franca Ferdinanda i Sofiju 28. juna 1914. — događaj koji je pokrenuo Prvi svjetski rat. Muzej je otvoren 1920. godine i prikazuje period austro-ugarske vladavine, administracije, zanatstva i kulturnog razvoja.',
    description_en:
      'At this location, Gavrilo Princip assassinated Archduke Franz Ferdinand and Sophie on June 28, 1914 — an event that triggered World War I. The museum opened in 1920 and showcases the Austro-Hungarian period of governance, administration, crafts, and cultural development.',
  },
  {
    name: 'Evropski Jeruzalem',
    searchTerms: ['Evropski Jeruzalem', 'European Jerusalem'],
    description_bs:
      'Više od četiri vijeka, Sarajevo je održavalo izvanrednu vjersku raznolikost — džamija, sinagoga i kršćanske crkve koegzistiraju na istim ulicama. Sefardski hram, Stara pravoslavna crkva, Gazi Husrev-begova džamija, Nova pravoslavna katedrala i Katolička katedrala — svi na pješačkoj udaljenosti.',
    description_en:
      "For over four centuries, Sarajevo maintained remarkable religious diversity — mosque, synagogue, and Christian churches coexisting on the same streets. The Sephardic Temple, Old Orthodox Church, Ghazi Husrev-bey's Mosque, New Orthodox Cathedral, and Catholic Cathedral — all within walking distance.",
  },
  {
    name: 'Tunel spasa',
    searchTerms: ['Tunel', 'Tunnel'],
    description_bs:
      'Tunel spasa je izgrađen tokom opsade Sarajeva 1992-1996 kao jedina veza opkoljenog grada sa slobodnom teritorijom. Danas je memorijalni kompleks koji čuva ključnu ratnu historiju i svjedoči o preživljavanju i otporu.',
    description_en:
      'The Tunnel of Salvation was built during the Siege of Sarajevo 1992-1996 as the only connection between the besieged city and free territory. Today it is a memorial complex preserving crucial wartime history and bearing witness to survival and resistance.',
  },
  {
    name: 'Bijambare pećine',
    searchTerms: ['Bijambare'],
    description_bs:
      'Zaštićeni speleološki rezervat 40 km sjeveroistočno od Sarajeva. Kompleks pećina okružen četinarskom šumom, potocima, jezercima i endemskim vrstama. Srednja Bijambarska pećina ima preko 400 metara sa stalaktitima i stalagmitima kroz četiri dvorane.',
    description_en:
      'Protected speleological reserve 40 km northeast of Sarajevo. A cave complex surrounded by conifer forest, brooks, lakes, and endemic species. The Middle Bijambare Cave extends over 400 meters with stalactites and stalagmites across four chambers.',
  },
  {
    name: 'Bjelašnica i Igman',
    searchTerms: ['Bjelašnica', 'Bjelasnica'],
    description_bs:
      'Domaćini Zimskih olimpijskih igara 1984. godine. Alpsko i nordijsko skijanje sa oko 25 kilometara kvalitetnih staza. Debeo snježni pokrivač od oko 135 cm traje približno 200 dana godišnje. Vrh na 2.067 metara.',
    description_en:
      'Host mountains of the 1984 Winter Olympics. Alpine and Nordic skiing with approximately 25 kilometers of quality trails. Thick snow cover of about 135 cm lasts approximately 200 days annually. Peak at 2,067 meters.',
  },
  {
    name: 'Skakavac vodopad',
    searchTerms: ['Skakavac'],
    description_bs:
      'Drugi najviši vodopad u Evropi sa 98 metara visine. Okružen endemskom florom unutar prirodnog parka. Do njega vodi trosatna šetnja kroz šumu jele, bukve, smreke i jasena.',
    description_en:
      "Europe's second-tallest waterfall at 98 meters. Surrounded by endemic flora within a natural park setting. Reached via a three-hour hike through fir, beech, spruce, and ash forest.",
  },
  {
    name: 'Vrelo Bosne',
    searchTerms: ['Vrelo Bosne'],
    description_bs:
      'Trokilometarski drvored od 726 stabala zasađenih 1894. vodi do krškog izvorišta sa preko 60 podzemnih izvora. Bačevski izvor snabdijeva Sarajevo pitkom vodom. U blizini se nalazi arheološka crkva Sv. Stjepana iz 10. vijeka.',
    description_en:
      'A three-kilometer tree-lined avenue of 726 trees planted in 1894 leads to a karst spring system with over 60 underground sources. The Bacevo spring supplies Sarajevo with drinking water. Nearby lies the archaeological Church of St. Stephen from the 10th century.',
  },
  {
    name: 'Lukomir',
    searchTerms: ['Lukomir'],
    description_bs:
      'Živi muzej na 1.496 metara nadmorske visine, koji čuva tradicionalni gorštački način života sa kamenom arhitekturom i drevnim tkanjem vune. Žene održavaju stogodišnju tradiciju ručno rađene tradicionalne odjeće. Od decembra do aprila dostupan samo pješice ili na skijama.',
    description_en:
      'A living museum at 1,496 meters elevation, preserving traditional highland lifestyle with stone architecture and ancestral wool-weaving. Women maintain centuries-old handmade traditional clothing traditions. Accessible only on foot or by skis from December to April.',
  },
];

async function findVenue(searchTerms: string[]): Promise<Venue | null> {
  for (const term of searchTerms) {
    const encoded = encodeURIComponent(`*${term}*`);
    const venues = await requestSupabaseAdminJson<Venue[]>(
      `/rest/v1/venues?name=ilike.${encoded}&select=id,name`,
    );
    if (venues.length > 0) {
      return venues[0];
    }
  }
  return null;
}

async function updateVenueDescriptions(
  venueId: string,
  description_bs: string,
  description_en: string,
): Promise<void> {
  await requestSupabaseAdminNoContent(
    `/rest/v1/venues?id=eq.${venueId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ description_bs, description_en }),
    },
  );
}

async function main() {
  console.log('=== Visit Sarajevo Description Updater ===\n');

  let matched = 0;
  let missed = 0;

  for (const attraction of ATTRACTIONS) {
    const venue = await findVenue(attraction.searchTerms);

    if (venue) {
      console.log(`MATCH: "${attraction.name}" → venue "${venue.name}" (${venue.id})`);
      await updateVenueDescriptions(venue.id, attraction.description_bs, attraction.description_en);
      console.log(`  Updated description_bs and description_en`);
      matched++;
    } else {
      console.log(`MISS:  "${attraction.name}" — no matching venue found (searched: ${attraction.searchTerms.join(', ')})`);
      missed++;
    }
  }

  console.log(`\n=== Done: ${matched} updated, ${missed} not found ===`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
