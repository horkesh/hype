const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageBreak
} = require("docx");

// ─── Color palette ──────────────────────────────────────────────────────────
const GOLD = "D4A056";
const DARK = "1A1A1A";
const MED_GRAY = "666666";
const LIGHT_GRAY = "F5F0EB";
const WHITE = "FFFFFF";
const GREEN = "2E7D32";
const ACCENT = "1A5F3A"; // Visit Sarajevo green

// ─── Helper shortcuts ───────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: DARK, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: GOLD, font: "Arial", size: 20 })] })],
  });
}

function dataCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({
        text,
        bold: !!opts.bold,
        color: opts.color || DARK,
        font: "Arial",
        size: opts.size || 20,
      })],
    })],
  });
}

function sectionTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: DARK })],
  });
}

function subTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: DARK })],
  });
}

function subSubTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 22, color: DARK })],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: opts.color || MED_GRAY, bold: !!opts.bold, italics: !!opts.italics })],
  });
}

function bulletPoint(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: "  •  ", font: "Arial", size: 22, color: GOLD }),
      new TextRun({ text, font: "Arial", size: 22, color: opts.color || MED_GRAY, bold: !!opts.bold }),
    ],
  });
}

function goldRule() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 1 } },
    children: [],
  });
}

function makeTable(headers, rows, widths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => headerCell(h, widths[i])),
  });
  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) => dataCell(cell, widths[ci], {
        bold: row._bold || false,
        shading: ri % 2 === 1 ? LIGHT_GRAY : undefined,
        align: ci >= 1 && !isNaN(parseInt(cell.replace(/[~.]/g, ""))) ? AlignmentType.RIGHT : AlignmentType.LEFT,
      })),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function boldRow(cells) {
  const row = [...cells];
  row._bold = true;
  return row;
}

// ─── Document content ───────────────────────────────────────────────────────

const children = [];

// Title page
children.push(
  new Paragraph({ spacing: { before: 2400 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "LOOK", font: "Arial", size: 72, bold: true, color: DARK })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "×", font: "Arial", size: 48, color: GOLD })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: "Visit Sarajevo", font: "Arial", size: 48, bold: true, color: ACCENT })],
  }),
  goldRule(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Finansijska ponuda za partnersku saradnju", font: "Arial", size: 28, color: MED_GRAY, italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Mart 2026.", font: "Arial", size: 24, color: MED_GRAY })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── Section 1: O projektu ──────────────────────────────────────────────────
children.push(
  sectionTitle("1. O projektu Look"),
  bodyText("Look je mobilna aplikacija (iOS i Android) i web platforma za otkrivanje Sarajeva — lokacija, događaja, noćnog života, kulture i gastronomije. Aplikacija koristi najnovije AI tehnologije kako bi posjetiocima i građanima pružila personalizirane preporuke na bosanskom i engleskom jeziku."),
  bodyText(""),
  subTitle("Šta je već završeno"),
  makeTable(
    ["Funkcionalnost", "Status"],
    [
      ["1.226 verificiranih sarajevskih lokacija", "Završeno"],
      ["Događaji uživo iz 3 izvora (Pozorista.ba, AllEvents, KupiKartu)", "Završeno"],
      ["Dvojezični interfejs (BS/EN)", "Završeno"],
      ["AI \"City Pulse\" — šta se trenutno dešava u gradu", "Završeno"],
      ["AI Planer večeri — personalizirani prijedlog za večer", "Završeno"],
      ["Pametna pretraga (prirodni jezik)", "Završeno"],
      ["Otkrivanje po raspoloženju (6 kategorija)", "Završeno"],
      ["Brendiranje Visit Sarajevo + logo", "Završeno"],
      ["Heritage šetnje (kulturno-historijske rute)", "80% završeno"],
      ["Web widget za VisitSarajevo.ba", "Novo — 2–3 sedmice"],
      ["Prijava na App Store (iOS + Android)", "Spremno za prijavu"],
      ["KupiKartu deep-linkovi za kupovinu karata", "Završeno"],
    ],
    [6500, 3000]
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── Section 2: Mjesečni troškovi ───────────────────────────────────────────
children.push(
  sectionTitle("2. Mjesečni troškovi infrastrukture"),
  subTitle("2.1 Fiksne pretplate"),
  makeTable(
    ["Usluga", "Namjena", "Mjesečno (KM)"],
    [
      ["Cloud baza podataka (Pro plan)", "Baza podataka, autentikacija, serverske funkcije, storage", "~49 KM"],
      ["Web hosting (Pro plan)", "Hosting web aplikacije, admin panel, widget", "~39 KM"],
      ["AI razvojni alati", "Razvoj, testiranje, automatizacija", "~392 KM"],
      ["Apple Developer Program", "Obavezno za iOS App Store", "~16 KM"],
      ["Google Play Developer", "Obavezno za Android Play Store", "~4 KM"],
      ["Domena + DNS", "Custom domena za web i API", "~6 KM"],
      boldRow(["Ukupno fiksno", "", "~506 KM/mj"]),
    ],
    [3200, 4200, 2100]
  ),
  bodyText(""),

  subTitle("2.2 AI servisni troškovi (ovisno o broju korisnika)"),
  bodyText("Aplikacija koristi više AI modela optimiziranih za različite funkcije (generisanje teksta, obrada slika, pretraga, parsiranje podataka). Troškovi rastu linearno s brojem korisnika."),
  makeTable(
    ["Broj korisnika (MAU)", "Sesija mjesečno", "AI troškovi (KM/mj)"],
    [
      ["50–100 (pilot)", "3.000", "~24 KM"],
      ["500 (lansiranje)", "15.000", "~118 KM"],
      ["1.000 (rast)", "30.000", "~235 KM"],
      ["5.000 (skaliranje)", "150.000", "~1.176 KM"],
    ],
    [3200, 3200, 3100]
  ),
  bodyText(""),
  bodyText("Pri 1.000 aktivnih korisnika mjesečno, kompletni AI troškovi su manji od jedne kafe dnevno u Sarajevu.", { italics: true }),
  bodyText(""),

  subTitle("2.3 Web scraping (prikupljanje podataka)"),
  makeTable(
    ["Stavka", "Mjesečno (KM)", "Napomena"],
    [
      ["Instagram scraping (50+ lokacija)", "~96 KM", "Automatski uvoz sadržaja s Instagram profila lokacija"],
      ["Scraping događaja", "0 KM", "Pozorista.ba, AllEvents, KupiKartu — vlastiti scraperi"],
      ["Skaliranje (po potrebi)", "do ~292 KM", "Samo ako se značajno poveća učestalost"],
    ],
    [3200, 2400, 3900]
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── Section 3: Ukupni troškovi po fazama ───────────────────────────────────
children.push(
  sectionTitle("3. Ukupni mjesečni troškovi po fazama"),

  subTitle("Faza A: Pilot (pred lansiranje, 50–100 korisnika)"),
  makeTable(
    ["Kategorija", "KM/mj"],
    [
      ["Fiksne pretplate", "506 KM"],
      ["AI servisi", "24 KM"],
      ["Web scraping", "96 KM"],
      boldRow(["Ukupno", "~626 KM/mj"]),
    ],
    [6500, 3000]
  ),
  bodyText(""),

  subTitle("Faza B: Lansiranje (500 korisnika, ljetna sezona)"),
  makeTable(
    ["Kategorija", "KM/mj"],
    [
      ["Fiksne pretplate", "506 KM"],
      ["AI servisi", "118 KM"],
      ["Web scraping", "96 KM"],
      boldRow(["Ukupno", "~725 KM/mj"]),
    ],
    [6500, 3000]
  ),
  bodyText(""),

  subTitle("Faza C: Rast (1.000 korisnika)"),
  makeTable(
    ["Kategorija", "KM/mj"],
    [
      ["Fiksne pretplate", "506 KM"],
      ["AI servisi", "235 KM"],
      ["Web scraping", "96 KM"],
      boldRow(["Ukupno", "~840 KM/mj"]),
    ],
    [6500, 3000]
  ),
  bodyText(""),

  subTitle("Faza D: Skaliranje (5.000 korisnika)"),
  makeTable(
    ["Kategorija", "KM/mj"],
    [
      ["Fiksne pretplate", "506 KM"],
      ["AI servisi", "1.176 KM"],
      ["Web scraping", "292 KM"],
      boldRow(["Ukupno", "~1.975 KM/mj"]),
    ],
    [6500, 3000]
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── Section 4: Web integracija ─────────────────────────────────────────────
children.push(
  sectionTitle("4. Web integracija za VisitSarajevo.ba"),
  bodyText("Turistička zajednica je izrazila želju da se Look poveže s njihovom web stranicom tako da žive informacije budu vidljive direktno na VisitSarajevo.ba."),
  bodyText(""),

  subTitle("Predloženo rješenje: Ugradivi web widget"),
  bodyText("Lagan, ugradivi widget koji Visit Sarajevo postavlja na svoju početnu stranicu. Widget automatski povlači žive podatke i prikazuje ih u brendiranom panelu."),
  bodyText(""),

  subSubTitle("Šta widget prikazuje"),
  bodyText(""),
  bodyText("Tab 1: \"Danas u Sarajevu\"", { bold: true }),
  bulletPoint("AI pregled — šta se trenutno dešava u gradu"),
  bulletPoint("Trenutno vrijeme"),
  bulletPoint("Top 3–5 događaja za danas"),
  bulletPoint("Svaki događaj vodi na Look aplikaciju ili web"),
  bodyText(""),
  bodyText("Tab 2: \"Popularna mjesta\"", { bold: true }),
  bulletPoint("Najpopularnije lokacije"),
  bulletPoint("Filteri po kategorijama (Kafane, Restorani, Kultura, Noćni život...)"),
  bulletPoint("Svaka lokacija: fotografija, naziv, kategorija, ocjena"),
  bodyText(""),
  bodyText("Tab 3: \"Večeras\"", { bold: true }),
  bulletPoint("Večernji događaji i preporuke"),
  bulletPoint("\"Planiraj večer\" — otvara AI Planer večeri"),
  bodyText(""),

  subSubTitle("Tehničke karakteristike"),
  bulletPoint("Jedna linija koda za ugradnju na bilo koju stranicu"),
  bulletPoint("Automatsko ažuriranje podataka (događaji svakih 6 sati, lokacije dnevno, AI pregled svakih 30 min)"),
  bulletPoint("Prilagodljiv dizajn (boje, jezik, broj stavki)"),
  bulletPoint("Responzivan — radi na mobilnom, tabletu i desktopu"),
  bulletPoint("Bez dodatnih mjesečnih troškova hostinga (pokriveno postojećim planom)"),
  bodyText(""),

  subSubTitle("Procjena razvoja widgeta"),
  makeTable(
    ["Zadatak", "Sati"],
    [
      ["Osnovna struktura widgeta", "8"],
      ["API za agregirane podatke", "4"],
      ["Tab \"Danas u Sarajevu\"", "6"],
      ["Tab \"Popularna mjesta\"", "6"],
      ["Tab \"Večeras\"", "4"],
      ["Integracija AI pregleda grada", "3"],
      ["Sistem tema (svjetlo/tamno/custom boje)", "4"],
      ["Responzivni dizajn", "4"],
      ["Deep linkovi (widget → app/web)", "3"],
      ["Testiranje i poliranje", "6"],
      boldRow(["Ukupno", "~48 sati"]),
    ],
    [6500, 3000]
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── Section 5: KupiKartu ───────────────────────────────────────────────────
children.push(
  sectionTitle("5. KupiKartu integracija"),
  bodyText("Turistička zajednica je predložila povezivanje s KupiKartu. Ovo je već ugrađeno:"),
  bulletPoint("KupiKartu je jedan od 3 izvora događaja u aplikaciji"),
  bulletPoint("Događaji uključuju linkove za kupovinu karata koji vode direktno na KupiKartu"),
  bulletPoint("Filtriranje po gradu osigurava da se prikazuju samo sarajevski događaji"),
  bodyText(""),
  bodyText("Dodatna vrijednost: Web widget na VisitSarajevo.ba prirodno integrira KupiKartu — posjetilac vidi događaj, klikne \"Kupi kartu\" i direktno kupuje na KupiKartu. Web stranica turističke zajednice postaje centralno mjesto: vidi šta se dešava → kupi kartu → planiraj večer.", { italics: true }),
  bodyText(""),
  goldRule(),
);

// ─── Section 6: Finansijska ponuda ──────────────────────────────────────────
children.push(
  sectionTitle("6. Finansijska ponuda — Faza 1 (april–septembar 2026)"),

  subTitle("Opcija A: Pokrivanje troškova infrastrukture (5.000–7.000 KM)"),
  bodyText("Pokriva 3 mjeseca infrastrukture + pripremu za App Store."),
  makeTable(
    ["Stavka", "KM"],
    [
      ["Cloud baza podataka — Pro plan (3 mj)", "147 KM"],
      ["Web hosting — Pro plan (3 mj)", "118 KM"],
      ["AI razvojni alati (3 mj)", "1.176 KM"],
      ["Web scraping (3 mj)", "288 KM"],
      ["AI servisi — pilot (3 mj)", "71 KM"],
      ["Apple Developer (godišnje)", "194 KM"],
      ["Google Play (jednokratno)", "49 KM"],
      ["Priprema za App Store (vizuali, opisi, testiranje)", "200 KM"],
      boldRow(["Infrastruktura ukupno", "~2.243 KM"]),
      ["Minimalna kompenzacija za pripremu aplikacije za objavu (~40–60 sati)", "2.757–4.757 KM"],
      boldRow(["UKUPNO", "5.000–7.000 KM"]),
    ],
    [6500, 3000]
  ),
  bodyText(""),
  bodyText("Ulažemo vlastito razvojno vrijeme. Potrebna nam je podrška za pokrivanje infrastrukturnih troškova da aplikacija bude živa do maja.", { italics: true }),
  bodyText(""),

  subTitle("Opcija B: Partnersko lansiranje (10.000–15.000 KM)"),
  bodyText("Pokriva infrastrukturu + razvoj web widgeta + pripremu za objavljivanje."),
  makeTable(
    ["Stavka", "KM"],
    [
      ["Infrastruktura (3 mjeseca)", "2.243 KM"],
      ["Razvoj web widgeta za VisitSarajevo.ba", "3.000 KM"],
      ["Priprema i objava na App Store (iOS + Android)", "2.000 KM"],
      ["Završavanje heritage šetnji (mapa)", "1.000 KM"],
      ["Testiranje i QA na 10+ uređaja", "1.500 KM"],
      boldRow(["UKUPNO", "~10.000–15.000 KM"]),
    ],
    [6500, 3000]
  ),
  bodyText(""),

  subTitle("Opcija C: Kompletna Faza 1 (18.000–25.000 KM)"),
  bodyText("Sve iz Opcije B plus napredne funkcionalnosti."),
  makeTable(
    ["Stavka", "KM"],
    [
      ["Opcija B", "~10.000 KM"],
      ["Push notifikacije", "2.500 KM"],
      ["Automatizacija prikupljanja podataka", "2.500 KM"],
      ["Admin dashboard za Visit Sarajevo", "3.000 KM"],
      ["Alati za moderaciju sadržaja", "2.000 KM"],
      boldRow(["UKUPNO", "~20.000–25.000 KM"]),
    ],
    [6500, 3000]
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── Section 7: Šta Visit Sarajevo dobija ───────────────────────────────────
children.push(
  sectionTitle("7. Šta Visit Sarajevo dobija odmah"),
  bulletPoint("Look na početnoj stranici — ugradivi web widget sa živim događajima i lokacijama", { bold: true }),
  bulletPoint("AI-pokretane turističke informacije — posjetioci pretražuju prirodnim jezikom, dobijaju trenutne odgovore", { bold: true }),
  bulletPoint("Sadržaj oživi — heritage šetnje, opisi lokacija, događaji postaju interaktivni", { bold: true }),
  bulletPoint("Podaci koje nemaju — 1.226 verificiranih lokacija sa radnim vremenom, fotografijama, kategorijama, AI opisima", { bold: true }),
  bulletPoint("Brendiranje svuda — logo Visit Sarajevo, atribucija, upute za prevoz", { bold: true }),
  bulletPoint("KupiKartu integracija — kupovina karata direktno iz aplikacije", { bold: true }),
  bodyText(""),
  goldRule(),
);

// ─── Section 8: Vremenski plan ──────────────────────────────────────────────
children.push(
  sectionTitle("8. Vremenski plan"),
  makeTable(
    ["Sedmica", "Isporuka"],
    [
      ["S1 (24–30. mart)", "Prototip web widgeta, finalizacija vizuala za App Store"],
      ["S2 (31. mart – 6. april)", "Widget povezan sa živim podacima, heritage šetnje završene"],
      ["S3 (7–13. april)", "Prijava na App Store (iOS + Android), widget na staging okruženju"],
      ["S4 (14–20. april)", "Period pregleda App Store-a, integracija widgeta na VisitSarajevo.ba"],
      ["S5 (21–27. april)", "QA, ispravke grešaka, soft launch"],
      ["S6 (1. maj —)", "Aplikacija živa za turističku sezonu"],
    ],
    [3000, 6500]
  ),
  bodyText(""),
  goldRule(),
);

// ─── Section 9: Faza 2 ─────────────────────────────────────────────────────
children.push(
  sectionTitle("9. Faza 2 — Septembar 2026"),
  bodyText("Sa podacima iz ljetne sezone (preuzimanja, korištenje, povratne informacije turista), planiramo proširenje saradnje:"),
  bulletPoint("Kompletne funkcionalnosti (gamifikacija, push notifikacije, offline mod)"),
  bulletPoint("12-mjesečni troškovi infrastrukture i AI servisa"),
  bulletPoint("Kontinuirana kuracija i moderacija sadržaja"),
  bulletPoint("Marketinški materijali"),
  bodyText(""),
  bodyText("Procijenjeni budžet za Fazu 2: 30.000–50.000 KM (potkrijepljeno stvarnim podacima o korištenju iz ljeta)", { bold: true }),
  bodyText(""),
  goldRule(),
);

// ─── Section 10: Napomene ───────────────────────────────────────────────────
children.push(
  sectionTitle("10. Napomene"),
  bulletPoint("Svi iznosi su bez PDV-a"),
  bulletPoint("Troškovi infrastrukture rastu s brojem korisnika — navedene cifre pokrivaju do ~10.000 aktivnih korisnika mjesečno"),
  bulletPoint("Kompletna tehnička infrastruktura za Look košta 625–840 KM mjesečno u fazi lansiranja — izuzetno nisko za aplikaciju s 8 AI funkcionalnosti, 1.226 lokacija, živim događajima i dvojezičnom podrškom"),
  bulletPoint("AI troškovi skaliraju linearno i predvidivo — bez iznenađenja"),
  bulletPoint("Aplikacija je spremna za lansiranje do maja 2026."),
);

// ─── Build document ─────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22, color: DARK },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Look × Visit Sarajevo", font: "Arial", size: 16, color: MED_GRAY, italics: true }),
            new TextRun({ text: "  |  ", font: "Arial", size: 16, color: "CCCCCC" }),
            new TextRun({ text: "Finansijska ponuda — Mart 2026.", font: "Arial", size: 16, color: MED_GRAY, italics: true }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Povjerljivo", font: "Arial", size: 16, color: MED_GRAY, italics: true })],
        })],
      }),
    },
    children,
  }],
});

// ─── Write to file ──────────────────────────────────────────────────────────
const outPath = __dirname + "/Look_x_VisitSarajevo_Finansijska_Ponuda.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log(`✓ Written to ${outPath} (${(buf.length / 1024).toFixed(0)} KB)`);
});
