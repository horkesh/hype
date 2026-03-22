/**
 * Seed Visit Sarajevo knowledge base with their website content.
 * This is manually curated content from visitsarajevo.ba for the Ask Sarajevo AI.
 * Run: node --env-file=backend/.env --import tsx backend/src/scripts/seedVisitSarajevoKB.ts
 */
import { requestSupabaseAdminNoContent } from '../lib/supabaseAdmin';

interface KBEntry {
  page_url: string;
  page_title: string;
  content_text: string;
  category: string;
}

const KB_ENTRIES: KBEntry[] = [
  // --- Top Attractions ---
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/bascarsija/',
    page_title: 'Baščaršija i Sebilj fontana',
    category: 'attractions',
    content_text: `Baščaršija je uspostavljena u 15. vijeku od strane Isa-bega Ishakovića i Gazi Husrev-bega. Do 16. vijeka postala je jedno od najvećih trgovačkih centara na Balkanu, sa 45 čaršija i preko 80 zanata. Prvi vodovodni sistem izgrađen je sredinom 15. vijeka; do kraja osmanskog perioda bilo je 156 česama. Sebilj fontana je izgrađena 1753. Ko god popije vode sa sarajevskih česama — vratiće se u Sarajevo. Baščaršija je srce starog grada i najposjećenije turističko odredište u Sarajevu. Kazandžiluk (ulica bakrača) nudi ručno rađene bakrene predmete. Ćevabdžinice, buregdžinice i kafane okružuju trg.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/city-hall/',
    page_title: 'Vijećnica (Gradska vijećnica)',
    category: 'attractions',
    content_text: `Završena 1896. godine u pseudo-maurskom stilu, po projektu arhitekte Alexandera Witteka. Jedan od najskupljih projekata Austro-Ugarske monarhije. Teško oštećena tokom opsade Sarajeva 1990-ih, obnovljena 2014. Staklena kupola je dodana kako bi riješila problem osvjetljenja auditorijuma. Simbolizira obrazovanje, nadu, umjetnost, kulturu, historiju i ljepotu. Danas je sjedište Nacionalne i univerzitetske biblioteke.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/latin-bridge/',
    page_title: 'Latinski most i Muzej atentata',
    category: 'attractions',
    content_text: `Na ovom mjestu je Gavrilo Princip izvršio atentat na nadvojvodu Franca Ferdinanda i njegovu suprugu Sofiju 28. juna 1914. — događaj koji je pokrenuo Prvi svjetski rat. Muzej je otvoren 1920. i prikazuje period austro-ugarske vladavine, administracije, zanatstva i kulturnog razvoja. Latinski most je jedan od najstarijih mostova u Sarajevu.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/european-jerusalem/',
    page_title: 'Evropski Jeruzalem',
    category: 'attractions',
    content_text: `Više od četiri vijeka, Sarajevo je održavalo izvanrednu vjersku raznolikost — džamija, sinagoga i kršćanske crkve koegzistiraju na istim ulicama. Sefardski hram, Stara pravoslavna crkva, Gazi Husrev-begova džamija, Nova pravoslavna katedrala i Katolička katedrala — svi na pješačkoj udaljenosti. Ova jedinstvenost je razlog zašto je Sarajevo poznato kao "Evropski Jeruzalem".`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/tunnel/',
    page_title: 'Tunel spasa',
    category: 'attractions',
    content_text: `Tunel spasa je izgrađen tokom opsade Sarajeva 1992-1996 kao jedina veza opkoljenog grada sa slobodnom teritorijom. Dug je 800 metara, visok 1,6 metara i širok 1 metar. Korišten za transport hrane, oružja i ranjenika. Danas je memorijalni kompleks sa muzejom i dijelom tunela koji se može posjetiti. Nalazi se u predgrađu Butmir, blizu aerodroma.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/bijambare/',
    page_title: 'Bijambare pećine',
    category: 'nature',
    content_text: `Zaštićeni speleološki rezervat 40 km sjeveroistočno od Sarajeva. Kompleks pećina okružen četinarskom šumom, potocima, jezercima i endemskim vrstama. Srednja Bijambarska pećina ima preko 400 metara sa stalaktitima i stalagmitima kroz četiri dvorane. Tri pećine su dostupne posjetiteljima. Idealno za planinarenje, ribolov i speleološka istraživanja.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/bjelasnica/',
    page_title: 'Bjelašnica i Igman',
    category: 'nature',
    content_text: `Domaćini Zimskih olimpijskih igara 1984. Alpsko i nordijsko skijanje sa oko 25 kilometara kvalitetnih staza. Debeo snježni pokrivač od oko 135 cm traje približno 200 dana godišnje. Vrh Bjelašnice na 2.067 metara. Na Bjelašnici se nalazi selo Lukomir — najviše selo u BiH. Meteorološki opservatorij uspostavljen 1984.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/skakavac/',
    page_title: 'Skakavac vodopad',
    category: 'nature',
    content_text: `Drugi najviši vodopad u Evropi sa 98 metara visine. Okružen endemskom florom unutar prirodnog parka. Do njega vodi trosatna šetnja kroz šumu jele, bukve, smreke i jasena. Popularan za fotografiju, planinarenje i branje gljiva. Nalazi se 12 km sjeverno od centra Sarajeva.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/vrelo-bosne/',
    page_title: 'Vrelo Bosne (Izvor Bosne)',
    category: 'nature',
    content_text: `Trokilometarski drvored od 726 stabala zasađenih 1894. vodi do krškog izvorišta sa preko 60 podzemnih izvora. Prostor od 603 hektara sa 26 biljnih i preko 20 životinjskih vrsta. Bačevski izvor snabdijeva Sarajevo pitkom vodom. U blizini se nalaze arheološka crkva Sv. Stjepana iz 10. vijeka i Rimski most. Fijakeri (konjske kočije) voze posjetitelje uz drvored.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/top-attractions/lukomir/',
    page_title: 'Lukomir',
    category: 'nature',
    content_text: `Živi muzej na 1.496 metara nadmorske visine. Čuva tradicionalni gorštački način života sa kamenom arhitekturom pokrivenom kamenim pločama i drevnim tkanjem vune. Žene održavaju stogodišnju tradiciju ručno rađene tradicionalne odjeće i šarenih vunenih dodataka. Od decembra do aprila selo je dostupno samo pješice ili na skijama. Udaljeno 42 km od Sarajeva.`,
  },

  // --- Places to Eat ---
  {
    page_url: 'https://www.visitsarajevo.ba/where-to-eat/',
    page_title: 'Gdje jesti u Sarajevu',
    category: 'food',
    content_text: `Sarajevo nudi bogatu kulinarsku scenu sa tradicionalnom bosanskom kuhinjom. Kategorije restorana: Restorani (raznovrsna kuhinja), Ašćinice (tradicionalna bosanska jela — begova čorba, dolma, japrak, bamija), Ćevabdžinice (ćevapi — sarajevski specijalitet od mljevenog mesa u somunu), Buregdžinice (burek sa mesom, sirom, zeljem ili krompirušom), Pekare (hljeb i pecivo), Slastičarne (baklava, tufahija, hurmašica), Brza hrana (pizza, hamburgeri).`,
  },

  // --- Transport ---
  {
    page_url: 'https://www.visitsarajevo.ba/plan-your-trip/getting-around/',
    page_title: 'Transport u Sarajevu',
    category: 'transport',
    content_text: `Sarajevo ima razvijenu mrežu javnog prevoza. Tramvaj: 7 linija, glavni koridor od Baščaršije do Ilidže. Autobus: šira mreža za predgrađa i prigradska naselja. Trolejbus: 4 linije za naselja iznad centra. Taxi: dostupan 24/7, aplikacije uključuju Cammeo i lokalne službe. Rent-a-car, rent-a-bike i električni trotineti (Lime) takođe dostupni. Sarajevo International Airport (SJJ) je 12 km od centra. Transfer autobusom ili taxijem.`,
  },

  // --- Sightseeing themes ---
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/sightseeing/ottoman/',
    page_title: 'Osmansko nasljeđe Sarajeva',
    category: 'sightseeing',
    content_text: `Osmanski period (1463-1878) je oblikovao Sarajevo u grad kakav poznajemo. Isa-beg Ishaković je osnovao grad 1462. Gazi Husrev-beg je izgradio džamiju, medresu, hamam, sahat-kulu i bezistan. Baščaršija, Morića Han, Svrzina kuća — svi iz ovog perioda. Kultura kahve (kafa u džezvi na ćumuru), filigran (bakreni radovi), i tradicionalni zanati žive i danas.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/sightseeing/austro-hungarian/',
    page_title: 'Austrougarsko nasljeđe Sarajeva',
    category: 'sightseeing',
    content_text: `Austro-Ugarska vladavina (1878-1918) je donijela modernu infrastrukturu: prvi tramvaj u Evropi (1885), Vijećnicu, Katoličku katedralu, Narodno pozorište, Zemaljski muzej, Vječni plamen. Grad je dobio električno osvjetljenje, vodovod i kanalizaciju. Ferhadija je postala glavna ulica sa evropskim fasadama.`,
  },
  {
    page_url: 'https://www.visitsarajevo.ba/what-to-see/sightseeing/siege/',
    page_title: 'Sarajevo pod opsadom',
    category: 'sightseeing',
    content_text: `Opsada Sarajeva (1992-1996) je najduža opsada glavnog grada u modernoj historiji — 1.425 dana. Tunel spasa je bio jedina veza sa slobodnom teritorijom. Sarajevske ruže (crvenom smolom ispunjeni krateri od granata) ostaju kao memorijali na ulicama. Muzej opsade, Tunel spasa, ratna groblja na Kovačima i memorijali su svjedoci otpora grada.`,
  },

  // --- General info ---
  {
    page_url: 'https://www.visitsarajevo.ba/about-sarajevo/',
    page_title: 'O Sarajevu',
    category: 'general',
    content_text: `Sarajevo — grad gdje se kulture grle. Glavni grad Bosne i Hercegovine sa oko 400.000 stanovnika. Osnovan 1461. Domaćin Zimskih olimpijskih igara 1984. Poznat po religijskoj raznolikosti (Evropski Jeruzalem), kulinarstvu (ćevapi, burek, kafa), historiji i toplini domaćina. Nadmorska visina 500 metara, okružen planinama. Klima: kontinentalna sa toplim ljetima i hladnim zimama.`,
  },
];

async function main() {
  console.log('=== Seeding Visit Sarajevo Knowledge Base ===\n');

  for (const entry of KB_ENTRIES) {
    console.log(`  Inserting: ${entry.page_title} (${entry.category})`);
    await requestSupabaseAdminNoContent('/rest/v1/visit_sarajevo_kb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(entry),
    });
  }

  console.log(`\n=== ${KB_ENTRIES.length} KB entries seeded! ===`);
}

main().catch(console.error);
