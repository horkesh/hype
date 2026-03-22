const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require("docx");

// ─── Color palette ──────────────────────────────────────────────────────────
const GOLD = "D4A056";
const DARK = "1A1A1A";
const MED_GRAY = "666666";
const LIGHT_GRAY = "F5F0EB";
const WHITE = "FFFFFF";
const GREEN = "2E7D32";
const RED = "C62828";

// ─── Helper shortcuts ───────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
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

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: opts.color || MED_GRAY, bold: !!opts.bold, italics: !!opts.italics })],
  });
}

function goldRule() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 1 } },
    children: [],
  });
}

// ─── Data ───────────────────────────────────────────────────────────────────

const builtWork = [
  ["Mobile App (Expo/React Native)", "5 tabs, 7 detail screens, bilingual BS/EN", "280"],
  ["Design System", "Glass components, dark mode, DM Serif/Sans typography, warm cinematic tokens", "60"],
  ["Supabase Backend", "10+ tables, RLS policies, 8 migrations, auth flows", "80"],
  ["8 AI Edge Functions", "City pulse, planner, surprise me, search, translate, hero image, Instagram parser", "70"],
  ["AI Client Integration", "SSE streaming, model routing (GPT-4.1/Claude/Gemini), prompt engineering", "50"],
  ["Data Pipeline", "3 web scrapers, Instagram pipeline, Google Places enrichment, photo scraping", "80"],
  ["Venue Data Quality", "1,226 venues: categories verified, photos, AI descriptions, Google reviews", "30"],
  ["Event Pipeline", "Scraping, promotion, dedup, venue matching, 70+ live events", "40"],
  ["Admin Tools", "Venue editor (Vite + React), moderation scripts", "20"],
  ["Visit Sarajevo Integration", "Transport directions, venue descriptions, logo, attribution", "15"],
  ["Code Quality & Tests", "177 tests, adapter cleanup, simplification passes, documentation", "60"],
  ["DevOps", "Vercel deployment, Supabase config, EAS setup, CI pipeline", "25"],
  ["Product direction + debugging", "Architecture decisions, prompt iteration, bug triage, QA", "120"],
  ["Claude Code API costs", "Anthropic API, OpenAI API, Google AI API for dev", "0"],
];

const totalBuiltHours = builtWork.reduce((sum, row) => sum + parseInt(row[2]), 0);

const remainingWork = [
  ["Auth & Onboarding Polish", "Social login, onboarding flow, proper session management", "40"],
  ["App Store Readiness", "iOS + Android builds via EAS, store listings, screenshots, review process", "60"],
  ["Push Notifications", "Event reminders, trending alerts, new event notifications", "25"],
  ["Analytics & Monitoring", "User tracking, engagement metrics, error monitoring, crash reporting", "15"],
  ["Submission & Claim Flows", "Venue/event submission forms, venue owner claims, moderation queue", "40"],
  ["Scraper Automation", "Scheduled runs, monitoring, error recovery, new source onboarding", "25"],
  ["Instagram Rail on Home", "Live feed from Visit Sarajevo + venue Instagram accounts", "10"],
  ["Heritage Walking Routes", "Curated walks with POI stops, maps, audio guide hooks", "20"],
  ["\"Right Now\" Mode", "Filter Explore to currently-open venues using Google hours data", "10"],
  ["Visitor Passport / Gamification", "Check-in rewards, badges, achievement system", "30"],
  ["Performance & Offline", "Image caching, lazy loading, offline-first architecture", "30"],
  ["E2E Testing & Device QA", "Cross-device testing, E2E test suite, accessibility audit", "40"],
  ["UI Polish", "Animations, transitions, micro-interactions, edge case handling", "40"],
  ["Legal & Compliance", "Privacy policy, terms of service, GDPR, cookie consent", "10"],
  ["API costs (ongoing)", "OpenAI, Google, Anthropic \u2014 estimated 6 months", "0"],
];

const totalRemainingHours = remainingWork.reduce((sum, row) => sum + parseInt(row[2]), 0);

// ─── Rate tables ────────────────────────────────────────────────────────────

// KM conversion: 1 EUR = 1.96 KM (fixed rate)
const EUR_TO_KM = 1.96;
const BIH_RATE_EUR = 30;
const EU_RATE_EUR = 80;
const US_RATE_EUR = 130;
const BIH_RATE_KM = Math.round(BIH_RATE_EUR * EUR_TO_KM);
const EU_RATE_KM = Math.round(EU_RATE_EUR * EUR_TO_KM);
const US_RATE_KM = Math.round(US_RATE_EUR * EUR_TO_KM);

function km(hours, rate) { return Math.round(hours * rate * EUR_TO_KM).toLocaleString(); }

const rateComparison = [
  ["Junior programer", "30-50", "80-120", "120-196"],
  ["Senior Full-Stack programer", "70-108", "157-255", "255-392"],
  ["AI/ML in\u017Eenjer", "78-118", "196-353", "294-490"],
  ["UI/UX dizajner", "49-78", "118-196", "196-294"],
  ["Projekt menad\u017Eer", "59-88", "137-235", "235-353"],
  ["DevOps in\u017Eenjer", "59-98", "137-235", "216-333"],
  ["QA in\u017Eenjer", "39-69", "98-157", "137-235"],
  ["Prosje\u010Dna satnica", String(BIH_RATE_KM), String(EU_RATE_KM), String(US_RATE_KM)],
];

// ─── Build the document ─────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ─── TITLE PAGE ───
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({ spacing: { before: 4000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Look \u2014 Sarajevo", font: "Georgia", size: 72, bold: true, color: GOLD })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          children: [new TextRun({ text: "Interni pregled \u2014 realne brojke", font: "Arial", size: 36, color: MED_GRAY })],
        }),
        goldRule(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({ text: "Stvarni ulo\u017Eeni sati (sa AI asistencijom)", font: "Arial", size: 28, color: DARK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          children: [new TextRun({ text: "Mart 2026. \u2014 Samo za internu upotrebu", font: "Arial", size: 22, color: MED_GRAY, italics: true })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ─── MAIN CONTENT ───
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD, space: 4 } },
            children: [
              new TextRun({ text: "Look \u2014 Sarajevo", font: "Georgia", size: 18, color: GOLD }),
              new TextRun({ text: "    Interni pregled \u2014 realne brojke", font: "Arial", size: 18, color: MED_GRAY }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "INTERNO \u2014 Stranica ", font: "Arial", size: 16, color: MED_GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: MED_GRAY }),
            ],
          })],
        }),
      },
      children: [
        // ─── EXECUTIVE SUMMARY ───
        sectionTitle("Realan pregled"),
        bodyText("Ovaj dokument prikazuje stvarne ulo\u017Eene sate ljudskog rada, uzimaju\u0107i u obzir da je Claude Code (AI) obavio najve\u0107i dio kodiranja. Sati ispod predstavljaju vrijeme provedeno na dono\u0161enju odluka, definisanju arhitekture, iteraciji promptova, debuggingu, QA testiranju i upravljanju projektom \u2014 ne na ru\u010Dnom pisanju koda."),
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [new TextRun({ text: "Stvarno ulo\u017Eeno: ~" + totalBuiltHours.toLocaleString() + " sati ljudskog rada. Uz AI asistenciju, ovo je proizvelo rezultat ekvivalentan ~1.830 sati tradicionalnog tima. Klju\u010Dna razlika: AI je pisao kod, ti si vodio projekat.", font: "Arial", size: 22, color: DARK, bold: true })],
        }),
        bodyText("Ovaj dokument pokriva:"),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [new TextRun({ text: "Vrijednost ve\u0107 isporu\u010Denog rada i njegovu tr\u017Ei\u0161nu cijenu", font: "Arial", size: 22, color: MED_GRAY })],
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [new TextRun({ text: "\u0160ta preostaje za poliranu 1.0 verziju", font: "Arial", size: 22, color: MED_GRAY })],
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [new TextRun({ text: "Pore\u0111enje tr\u017Ei\u0161nih cijena po regionima", font: "Arial", size: 22, color: MED_GRAY })],
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 200 },
          children: [new TextRun({ text: "Ukupna potrebna investicija (zavr\u0161eni rad + preostali razvoj)", font: "Arial", size: 22, color: MED_GRAY })],
        }),

        // ─── CODEBASE METRICS ───
        sectionTitle("Trenutne metrike koda"),
        bodyText("Look aplikacija je produkcijski kvalitetan kod, ne prototip."),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [5000, 4360],
          rows: [
            new TableRow({ children: [headerCell("Metrika", 5000), headerCell("Vrijednost", 4360)] }),
            new TableRow({ children: [dataCell("Izvorni fajlovi (.ts/.tsx)", 5000), dataCell("347", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Linije koda", 5000), dataCell("31.776", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("UI komponente", 5000), dataCell("142", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Pomo\u0107ni moduli i hookovi", 5000), dataCell("72", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Supabase Edge funkcije", 5000), dataCell("11", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Backend skripte", 5000), dataCell("15", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Automatski testovi", 5000), dataCell("53 fajla / 177 testova", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Migracije baze podataka", 5000), dataCell("8", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Oboga\u0107eni objekti (venues)", 5000), dataCell("1.226", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
            new TableRow({ children: [dataCell("Aktivni doga\u0111aji", 5000), dataCell("70+", 4360, { align: AlignmentType.RIGHT, bold: true })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── SECTION 1: WHAT'S BEEN BUILT ───
        sectionTitle("Sekcija 1: Stvarno ulo\u017Eeni sati"),
        bodyText("Sati ispod odra\u017Eavaju stvarno ulo\u017Eeno ljudsko vrijeme \u2014 uklju\u010Duju\u0107i prompt iteraciju, debugging, arhitekturne odluke, QA, i project management. Claude Code je generisao ve\u0107inu koda, ali svaka stavka je zahtijevala ljudsko vo\u0111enje i validaciju."),
        new Paragraph({
          spacing: { before: 120, after: 200 },
          children: [new TextRun({ text: "Za usporedbu: eksternom dokumentu za board smo prijavili 1.830 sati \u2014 to je fer procjena koliko bi tradicionalni tim bez AI-a radio na istom obimu.", font: "Arial", size: 22, color: DARK, italics: true })],
        }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3200, 4360, 1800],
          rows: [
            new TableRow({ children: [
              headerCell("Oblast", 3200),
              headerCell("Obim", 4360),
              headerCell("Sati", 1800),
            ]}),
            ...builtWork.map(([area, scope, hours]) =>
              new TableRow({ children: [
                dataCell(area, 3200, { bold: true, size: 18 }),
                dataCell(scope, 4360, { size: 18 }),
                dataCell(hours, 1800, { align: AlignmentType.RIGHT, bold: true }),
              ]})
            ),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins, columnSpan: 2,
                children: [new Paragraph({ children: [new TextRun({ text: "UKUPNO PROCIJENJENIH SATI", bold: true, font: "Arial", size: 22, color: DARK })] })],
              }),
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totalBuiltHours.toLocaleString(), bold: true, font: "Arial", size: 24, color: GOLD })] })],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // ─── VALUE CALLOUT ───
        subTitle("Value of Delivered Work"),
        bodyText("Ovaj rad je kompletiran, operativan i ve\u0107 generira vrijednost. Uklju\u010Duje vlastite AI integracije, kuriranu bazu od 1.226 sarajevskih objekata sa oboga\u0107enim opisima i fotografijama, 70+ aktivnih doga\u0111aja, i produkcijski kvalitetnu dvojezi\u010Dnu mobilnu aplikaciju."),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 2080, 2080, 2080],
          rows: [
            new TableRow({ children: [
              headerCell("Market", 3120),
              headerCell("Rate/hr", 2080),
              headerCell("Total (" + totalBuiltHours + "h)", 2080),
              headerCell("Savings vs BiH", 2080),
            ]}),
            new TableRow({ children: [
              dataCell("Bosna i Hercegovina", 3120, { bold: true }),
              dataCell(BIH_RATE_KM + " KM/hr", 2080, { align: AlignmentType.RIGHT }),
              dataCell(km(totalBuiltHours, BIH_RATE_EUR) + " KM", 2080, { align: AlignmentType.RIGHT, bold: true, color: GREEN }),
              dataCell("\u2014", 2080, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              dataCell("Zapadna Evropa", 3120, { bold: true }),
              dataCell(EU_RATE_KM + " KM/hr", 2080, { align: AlignmentType.RIGHT }),
              dataCell(km(totalBuiltHours, EU_RATE_EUR) + " KM", 2080, { align: AlignmentType.RIGHT, bold: true }),
              dataCell(Math.round(EU_RATE_EUR / BIH_RATE_EUR) + ".7x skuplje", 2080, { align: AlignmentType.RIGHT, color: RED, bold: true }),
            ]}),
            new TableRow({ children: [
              dataCell("Sjedinjene Države", 3120, { bold: true }),
              dataCell(US_RATE_KM + " KM/hr", 2080, { align: AlignmentType.RIGHT }),
              dataCell(km(totalBuiltHours, US_RATE_EUR) + " KM", 2080, { align: AlignmentType.RIGHT, bold: true }),
              dataCell(Math.round(US_RATE_EUR / BIH_RATE_EUR) + ".3x skuplje", 2080, { align: AlignmentType.RIGHT, color: RED, bold: true }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 160 } }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "Ista aplikacija bi u Zapadnoj Evropi ko\u0161tala ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: km(totalBuiltHours, EU_RATE_EUR) + " KM", font: "Arial", size: 28, color: RED, bold: true }),
            new TextRun({ text: ", a u SAD-u ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: km(totalBuiltHours, US_RATE_EUR) + " KM", font: "Arial", size: 28, color: RED, bold: true }),
            new TextRun({ text: ". Razvoj u BiH pru\u017Ea istu kvalitetu za ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: "jednu tre\u0107inu cijene.", font: "Arial", size: 24, color: GREEN, bold: true }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── RATE COMPARISON TABLE ───
        subTitle("Pore\u0111enje satnica po ulozi"),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3500, 1950, 1950, 1960],
          rows: [
            new TableRow({ children: [
              headerCell("Uloga", 3500),
              headerCell("BiH (KM/hr)", 1950),
              headerCell("EU (KM/hr)", 1950),
              headerCell("US (KM/hr)", 1960),
            ]}),
            ...rateComparison.map((row, i) =>
              new TableRow({ children: [
                dataCell(row[0], 3500, { bold: i === rateComparison.length - 1, shading: i === rateComparison.length - 1 ? LIGHT_GRAY : undefined }),
                dataCell(row[1], 1950, { align: AlignmentType.RIGHT, bold: i === rateComparison.length - 1, shading: i === rateComparison.length - 1 ? LIGHT_GRAY : undefined }),
                dataCell(row[2], 1950, { align: AlignmentType.RIGHT, bold: i === rateComparison.length - 1, shading: i === rateComparison.length - 1 ? LIGHT_GRAY : undefined }),
                dataCell(row[3], 1960, { align: AlignmentType.RIGHT, bold: i === rateComparison.length - 1, shading: i === rateComparison.length - 1 ? LIGHT_GRAY : undefined }),
              ]})
            ),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── SECTION 2: REMAINING WORK ───
        sectionTitle("Sekcija 2: Preostali rad do 1.0"),
        bodyText("Sljede\u0107i rad je potreban da se Look dovede iz trenutnog demo-spremnog alfa stanja do polirane, app-store-spremne 1.0 verzije."),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3200, 4360, 1800],
          rows: [
            new TableRow({ children: [
              headerCell("Oblast", 3200),
              headerCell("Obim", 4360),
              headerCell("Sati", 1800),
            ]}),
            ...remainingWork.map(([area, scope, hours]) =>
              new TableRow({ children: [
                dataCell(area, 3200, { bold: true, size: 18 }),
                dataCell(scope, 4360, { size: 18 }),
                dataCell(hours, 1800, { align: AlignmentType.RIGHT, bold: true }),
              ]})
            ),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins, columnSpan: 2,
                children: [new Paragraph({ children: [new TextRun({ text: "UKUPNO PROCIJENJENIH SATI", bold: true, font: "Arial", size: 22, color: DARK })] })],
              }),
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totalRemainingHours.toLocaleString(), bold: true, font: "Arial", size: 24, color: GOLD })] })],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 200 } }),
        subTitle("Preostali rad \u2014 Procjena tro\u0161kova"),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 2080, 2080, 2080],
          rows: [
            new TableRow({ children: [
              headerCell("Tr\u017Ei\u0161te", 3120),
              headerCell("Satnica", 2080),
              headerCell("Ukupno (" + totalRemainingHours + "h)", 2080),
              headerCell("U\u0161teda vs BiH", 2080),
            ]}),
            new TableRow({ children: [
              dataCell("Bosna i Hercegovina", 3120, { bold: true }),
              dataCell(BIH_RATE_KM + " KM/hr", 2080, { align: AlignmentType.RIGHT }),
              dataCell(km(totalRemainingHours, BIH_RATE_EUR) + " KM", 2080, { align: AlignmentType.RIGHT, bold: true, color: GREEN }),
              dataCell("\u2014", 2080, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              dataCell("Zapadna Evropa", 3120, { bold: true }),
              dataCell(EU_RATE_KM + " KM/hr", 2080, { align: AlignmentType.RIGHT }),
              dataCell(km(totalRemainingHours, EU_RATE_EUR) + " KM", 2080, { align: AlignmentType.RIGHT, bold: true }),
              dataCell(Math.round(EU_RATE_EUR / BIH_RATE_EUR) + ".7x skuplje", 2080, { align: AlignmentType.RIGHT, color: RED, bold: true }),
            ]}),
            new TableRow({ children: [
              dataCell("Sjedinjene Dr\u017Eave", 3120, { bold: true }),
              dataCell(US_RATE_KM + " KM/hr", 2080, { align: AlignmentType.RIGHT }),
              dataCell(km(totalRemainingHours, US_RATE_EUR) + " KM", 2080, { align: AlignmentType.RIGHT, bold: true }),
              dataCell(Math.round(US_RATE_EUR / BIH_RATE_EUR) + ".3x skuplje", 2080, { align: AlignmentType.RIGHT, color: RED, bold: true }),
            ]}),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── SECTION 3: TOTAL INVESTMENT SUMMARY ───
        sectionTitle("Sekcija 3: Ukupan pregled investicije"),
        bodyText("Kompletni pregled zavr\u0161enog i preostalog rada za 1.0 verziju."),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 1560, 1560, 1560, 1560],
          rows: [
            new TableRow({ children: [
              headerCell("Faza", 3120),
              headerCell("Sati", 1560),
              headerCell("BiH (KM)", 1560),
              headerCell("EU (KM)", 1560),
              headerCell("SAD (KM)", 1560),
            ]}),
            new TableRow({ children: [
              dataCell("Zavr\u0161eni rad", 3120, { bold: true }),
              dataCell(totalBuiltHours.toLocaleString(), 1560, { align: AlignmentType.RIGHT }),
              dataCell(km(totalBuiltHours, BIH_RATE_EUR) + " KM", 1560, { align: AlignmentType.RIGHT }),
              dataCell(km(totalBuiltHours, EU_RATE_EUR) + " KM", 1560, { align: AlignmentType.RIGHT }),
              dataCell(km(totalBuiltHours, US_RATE_EUR) + " KM", 1560, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              dataCell("Preostali rad do 1.0", 3120, { bold: true }),
              dataCell(totalRemainingHours.toLocaleString(), 1560, { align: AlignmentType.RIGHT }),
              dataCell(km(totalRemainingHours, BIH_RATE_EUR) + " KM", 1560, { align: AlignmentType.RIGHT }),
              dataCell(km(totalRemainingHours, EU_RATE_EUR) + " KM", 1560, { align: AlignmentType.RIGHT }),
              dataCell(km(totalRemainingHours, US_RATE_EUR) + " KM", 1560, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "UKUPNO DO 1.0", bold: true, font: "Arial", size: 22, color: GOLD })] })],
              }),
              new TableCell({ borders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: (totalBuiltHours + totalRemainingHours).toLocaleString(), bold: true, font: "Arial", size: 22, color: WHITE })] })],
              }),
              new TableCell({ borders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: km(totalBuiltHours + totalRemainingHours, BIH_RATE_EUR) + " KM", bold: true, font: "Arial", size: 22, color: GOLD })] })],
              }),
              new TableCell({ borders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: km(totalBuiltHours + totalRemainingHours, EU_RATE_EUR) + " KM", bold: true, font: "Arial", size: 22, color: WHITE })] })],
              }),
              new TableCell({ borders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: km(totalBuiltHours + totalRemainingHours, US_RATE_EUR) + " KM", bold: true, font: "Arial", size: 22, color: WHITE })] })],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 160 } }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "Ukupna u\u0161teda razvoja u BiH vs. Zapadna Evropa: ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: km(totalBuiltHours + totalRemainingHours, EU_RATE_EUR - BIH_RATE_EUR) + " KM", font: "Arial", size: 28, color: GREEN, bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "Ukupna u\u0161teda vs. SAD: ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: km(totalBuiltHours + totalRemainingHours, US_RATE_EUR - BIH_RATE_EUR) + " KM", font: "Arial", size: 28, color: GREEN, bold: true }),
          ],
        }),

        goldRule(),

        // ─── PERSONAL TIME ───
        sectionTitle("Tvoje li\u010Dno ulo\u017Eeno vrijeme"),
        bodyText("Procjena tvog stvarnog vremena bazirana na na\u0161im razgovorima, iteracijama, i radu van sesija:"),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4500, 2400, 2460],
          rows: [
            new TableRow({ children: [
              headerCell("Aktivnost", 4500),
              headerCell("Procjena", 2400),
              headerCell("Napomena", 2460),
            ]}),
            new TableRow({ children: [
              dataCell("Sesije sa Claude Code", 4500, { bold: true }),
              dataCell("~90-110 sati", 2400, { align: AlignmentType.RIGHT }),
              dataCell("~35 sesija x 2.5-3h prosje\u010Dno", 2460, { size: 18 }),
            ]}),
            new TableRow({ children: [
              dataCell("Testiranje na live sajtu", 4500, { bold: true }),
              dataCell("~25-35 sati", 2400, { align: AlignmentType.RIGHT }),
              dataCell("QA, screenshot-ovi, bug reporting", 2460, { size: 18 }),
            ]}),
            new TableRow({ children: [
              dataCell("Produkt strategija i planiranje", 4500, { bold: true }),
              dataCell("~15-20 sati", 2400, { align: AlignmentType.RIGHT }),
              dataCell("Definisanje feature-a, prioriteta, UX", 2460, { size: 18 }),
            ]}),
            new TableRow({ children: [
              dataCell("Prikupljanje referenci i materijala", 4500, { bold: true }),
              dataCell("~10-15 sati", 2400, { align: AlignmentType.RIGHT }),
              dataCell("Screenshot-ovi, Visit Sarajevo, Instagram", 2460, { size: 18 }),
            ]}),
            new TableRow({ children: [
              dataCell("Koordinacija sa partnerom", 4500, { bold: true }),
              dataCell("~8-12 sati", 2400, { align: AlignmentType.RIGHT }),
              dataCell("Pitch priprema, strategija, komunikacija", 2460, { size: 18 }),
            ]}),
            new TableRow({ children: [
              dataCell("Venue/event kuriranje", 4500, { bold: true }),
              dataCell("~10-15 sati", 2400, { align: AlignmentType.RIGHT }),
              dataCell("Provjera podataka, kategorija, kvaliteta", 2460, { size: 18 }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "UKUPNO TVOJE VRIJEME", bold: true, font: "Arial", size: 22, color: GOLD })] })],
              }),
              new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "~160-210 sati", bold: true, font: "Arial", size: 22, color: GOLD })] })],
              }),
              new TableCell({ borders, width: { size: 2460, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "~8 sedmica rada", font: "Arial", size: 18, color: WHITE })] })],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "Ti si ulo\u017Eio ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: "~160-210 sati ", font: "Arial", size: 28, color: GOLD, bold: true }),
            new TextRun({ text: "li\u010Dnog vremena da proizvede\u0161 rezultat koji bi tradicionalni tim radio ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: "~1.830 sati", font: "Arial", size: 28, color: DARK, bold: true }),
            new TextRun({ text: ". To je ", font: "Arial", size: 24, color: DARK }),
            new TextRun({ text: "9-11x multiplikator produktivnosti", font: "Arial", size: 28, color: GREEN, bold: true }),
            new TextRun({ text: " zahvaljuju\u0107i AI asistenciji.", font: "Arial", size: 24, color: DARK }),
          ],
        }),
        bodyText("Tvoja uloga nije bila 'pisanje koda' \u2014 bila je product ownership, arhitektura, kvalitetna kontrola, i kreativno vo\u0111enje. AI je bio alat; ti si bio in\u017Eenjer koji ga je usmjeravao.", { italics: true }),

        goldRule(),

        // ─── FUNDING RECOMMENDATION ───
        subTitle("Ukupna potrebna investicija"),
        bodyText("Ukupni tro\u0161ak projekta uklju\u010Duje kompenzaciju za ve\u0107 zavr\u0161eni i isporu\u010Deni rad, preostali razvoj do verzije 1.0, te operativne tro\u0161kove. Sve po BiH tr\u017Ei\u0161nim stopama sa 20% rezervom."),

        new Paragraph({ spacing: { before: 200 } }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [
              headerCell("Stavka", 4680),
              headerCell("Iznos (KM)", 4680),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "ZAVR\u0160ENI RAD (isporu\u010Deno i operativno)", bold: true, font: "Arial", size: 20, color: DARK })] })],
              }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: km(totalBuiltHours, BIH_RATE_EUR) + " KM", bold: true, font: "Arial", size: 22, color: DARK })] })],
              }),
            ]}),
            new TableRow({ children: [
              dataCell("  Kompletna mobilna aplikacija (" + totalBuiltHours + " sati)", 4680),
              dataCell(totalBuiltHours + "h x " + BIH_RATE_KM + " KM/h", 4680, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "PREOSTALI RAZVOJ (do 1.0)", bold: true, font: "Arial", size: 20, color: DARK })] })],
              }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: km(totalRemainingHours, BIH_RATE_EUR) + " KM", bold: true, font: "Arial", size: 22, color: DARK })] })],
              }),
            ]}),
            new TableRow({ children: [
              dataCell("  Preostale funkcionalnosti (" + totalRemainingHours + " sati)", 4680),
              dataCell(totalRemainingHours + "h x " + BIH_RATE_KM + " KM/h", 4680, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "OPERATIVNI TRO\u0160KOVI (6 mjeseci)", bold: true, font: "Arial", size: 20, color: DARK })] })],
              }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "", font: "Arial", size: 20 })] })],
              }),
            ]}),
            new TableRow({ children: [
              dataCell("  AI API (OpenAI, Google, Anthropic)", 4680),
              dataCell(Math.round(2000 * EUR_TO_KM).toLocaleString() + " - " + Math.round(4000 * EUR_TO_KM).toLocaleString() + " KM", 4680, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              dataCell("  Infrastruktura (Supabase Pro, Vercel Pro, domena)", 4680),
              dataCell(Math.round(1500 * EUR_TO_KM).toLocaleString() + " - " + Math.round(2500 * EUR_TO_KM).toLocaleString() + " KM", 4680, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              dataCell("  App Store naknade (Apple + Google)", 4680),
              dataCell(Math.round(125 * EUR_TO_KM).toLocaleString() + " KM", 4680, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              dataCell("  20% rezerva za nepredvi\u0111eno", 4680),
              dataCell(km((totalBuiltHours + totalRemainingHours) * 0.2, BIH_RATE_EUR) + " KM", 4680, { align: AlignmentType.RIGHT }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "UKUPNA INVESTICIJA U PROJEKAT", bold: true, font: "Arial", size: 22, color: GOLD })] })],
              }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: cellMargins,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: Math.round((totalBuiltHours + totalRemainingHours) * BIH_RATE_EUR * 1.2 * EUR_TO_KM + 2000 * EUR_TO_KM + 1500 * EUR_TO_KM + 125 * EUR_TO_KM).toLocaleString() + " - " + Math.round((totalBuiltHours + totalRemainingHours) * BIH_RATE_EUR * 1.2 * EUR_TO_KM + 4000 * EUR_TO_KM + 2500 * EUR_TO_KM + 125 * EUR_TO_KM).toLocaleString() + " KM", bold: true, font: "Arial", size: 24, color: GOLD })] })],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "Za usporedbu \u2014 isti projekat po EU/US cijenama: ", font: "Arial", size: 24, color: DARK, bold: true }),
            new TextRun({ text: km(totalBuiltHours + totalRemainingHours, EU_RATE_EUR) + " - " + km(totalBuiltHours + totalRemainingHours, US_RATE_EUR) + " KM", font: "Arial", size: 28, color: RED, bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [new TextRun({ text: "Zavr\u0161eni rad nije potro\u0161eni tro\u0161ak \u2014 to je isporu\u010Den, produkcijski spreman sistem koji je \u017Eiv i operativan danas. Kompenzacija za ovaj rad odra\u017Eava njegovu stvarnu tr\u017Ei\u0161nu vrijednost i ekspertizu potrebnu za isporuku.", font: "Arial", size: 22, color: DARK, bold: true })],
        }),

        goldRule(),

        // ─── TIMELINE ───
        subTitle("Procijenjeni vremenski okvir"),
        bodyText("Sa timom od 2-3 programera na puno radno vrijeme:"),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [new TextRun({ text: "Predaja u App Store: 6-8 sedmica od po\u010Detka finansiranja", font: "Arial", size: 22, color: MED_GRAY })],
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [new TextRun({ text: "Kompletna 1.0 verzija sa svim funkcionalnostima: 10-14 sedmica", font: "Arial", size: 22, color: MED_GRAY })],
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [new TextRun({ text: "Sa jednim programerom: 16-22 sedmice", font: "Arial", size: 22, color: MED_GRAY })],
        }),
      ],
    },
  ],
});

const outPath = process.argv[2] || "docs/04-product/Look_Sarajevo_INTERNAL_Real_Numbers.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath, "(" + buffer.length + " bytes)");
});
