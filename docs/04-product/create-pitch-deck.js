const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

pres.layout = "LAYOUT_16x9";
pres.author = "Look - Sarajevo";
pres.title = "Look x Visit Sarajevo — Partnerski prijedlog";

// === DESIGN CONSTANTS ===
const DARK = "121212";
const CARD = "1E1E1E";
const GOLD = "D4A056";
const GOLD_DIM = "8B6B3A";
const WHITE = "FFFFFF";
const GRAY = "A0A0A0";
const LIGHT_BG = "F5F0EB";

const TITLE_FONT = "Georgia";
const BODY_FONT = "Calibri";

const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, color: "000000", opacity: 0.2, angle: 135 });

// =============================================
// SLIDE 1 — TITLE
// =============================================
const s1 = pres.addSlide();
s1.background = { color: DARK };

// Gold accent bar at top
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s1.addText("Look", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.2,
  fontSize: 54, fontFace: TITLE_FONT, color: GOLD, bold: true, margin: 0,
});

s1.addText("Sarajevo", {
  x: 0.8, y: 2.2, w: 8.4, h: 0.6,
  fontSize: 28, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.1, w: 1.5, h: 0.04, fill: { color: GOLD } });

s1.addText("Partnerski prijedlog za\nTurističku zajednicu Kantona Sarajevo", {
  x: 0.8, y: 3.5, w: 8, h: 0.9,
  fontSize: 18, fontFace: BODY_FONT, color: WHITE, lineSpacingMultiple: 1.3, margin: 0,
});

s1.addText("Mart 2026.", {
  x: 0.8, y: 4.8, w: 3, h: 0.4,
  fontSize: 13, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// =============================================
// SLIDE 2 — PROBLEM / OPPORTUNITY
// =============================================
const s2 = pres.addSlide();
s2.background = { color: DARK };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s2.addText("Vaš sadržaj zaslužuje više", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});

// Left column — problem
s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 4, h: 3.2, fill: { color: CARD }, shadow: makeShadow() });
s2.addText("Danas", {
  x: 1.1, y: 1.7, w: 3.4, h: 0.5,
  fontSize: 18, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0,
});
s2.addText([
  { text: "Vaš web sajt ima bogat sadržaj", options: { bullet: true, breakLine: true, color: GRAY } },
  { text: "10 vrhunskih atrakcija detaljno opisanih", options: { bullet: true, breakLine: true, color: GRAY } },
  { text: "Historijske šetnje, transport, hrana", options: { bullet: true, breakLine: true, color: GRAY } },
  { text: "33K pratilaca na Instagramu", options: { bullet: true, breakLine: true, color: GRAY } },
  { text: "Ali sve to živi na statičnim stranicama", options: { bullet: true, color: "F96167" } },
], { x: 1.1, y: 2.3, w: 3.4, h: 2.2, fontSize: 13, fontFace: BODY_FONT, paraSpaceAfter: 6, margin: 0 });

// Right column — solution
s2.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.5, w: 4, h: 3.2, fill: { color: CARD }, shadow: makeShadow() });
s2.addText("Sa Look aplikacijom", {
  x: 5.5, y: 1.7, w: 3.4, h: 0.5,
  fontSize: 18, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0,
});
s2.addText([
  { text: "Vaš sadržaj postaje interaktivan", options: { bullet: true, breakLine: true, color: WHITE } },
  { text: "Turisti ga koriste u realnom vremenu", options: { bullet: true, breakLine: true, color: WHITE } },
  { text: "AI odgovara na pitanja iz vaših tekstova", options: { bullet: true, breakLine: true, color: WHITE } },
  { text: "Instagram objave žive u aplikaciji", options: { bullet: true, breakLine: true, color: WHITE } },
  { text: "Sve brendirano — Visit Sarajevo", options: { bullet: true, color: GOLD } },
], { x: 5.5, y: 2.3, w: 3.4, h: 2.2, fontSize: 13, fontFace: BODY_FONT, paraSpaceAfter: 6, margin: 0 });

// =============================================
// SLIDE 3 — LOOK U BROJKAMA
// =============================================
const s3 = pres.addSlide();
s3.background = { color: DARK };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s3.addText("Look u brojkama", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});

const stats = [
  { num: "1.226", label: "objekata u bazi" },
  { num: "70+", label: "aktivnih događaja" },
  { num: "9", label: "AI funkcija" },
  { num: "12", label: "raspoloženja za filtriranje" },
];

stats.forEach((s, i) => {
  const x = 0.8 + i * 2.25;
  s3.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 2, h: 2.5, fill: { color: CARD }, shadow: makeShadow() });
  s3.addText(s.num, {
    x, y: 1.9, w: 2, h: 1,
    fontSize: 42, fontFace: TITLE_FONT, color: GOLD, bold: true, align: "center", margin: 0,
  });
  s3.addText(s.label, {
    x, y: 3, w: 2, h: 0.6,
    fontSize: 13, fontFace: BODY_FONT, color: GRAY, align: "center", margin: 0,
  });
});

s3.addText("Pokriva sve kafiće, restorane, barove, klubove, muzeje, galerije, parkove i znamenitosti u Sarajevu", {
  x: 0.8, y: 4.5, w: 8.4, h: 0.5,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, align: "center", margin: 0,
});

// =============================================
// SLIDE 4 — FEATURE: HERITAGE WALKS
// =============================================
const s4 = pres.addSlide();
s4.background = { color: DARK };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s4.addText("Šetnje kroz historiju", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});
s4.addText("Vaši turistički sadržaji pretvoreni u interaktivne ture", {
  x: 0.8, y: 1.1, w: 8.4, h: 0.4,
  fontSize: 14, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

const walks = [
  { title: "Osmansko Sarajevo", stops: "Sebilj \u2192 Gazi Husrev-begova \u2192 Morića Han \u2192 Brusa bezistan \u2192 Baščaršija", time: "75 min \u00b7 1.5 km" },
  { title: "Austrougarsko Sarajevo", stops: "Vijećnica \u2192 Latinski most \u2192 Katedrala \u2192 Narodno pozorište \u2192 Vječni plamen", time: "60 min \u00b7 1.8 km" },
  { title: "Evropski Jeruzalem", stops: "Pravoslavna \u2192 Sinagoga \u2192 Džamija \u2192 Katedrala \u2192 Saborna crkva", time: "50 min \u00b7 1.0 km" },
];

walks.forEach((w, i) => {
  const y = 1.8 + i * 1.15;
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 1, fill: { color: CARD }, shadow: makeShadow() });
  s4.addText(w.title, {
    x: 1.1, y: y + 0.12, w: 4, h: 0.35,
    fontSize: 16, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0,
  });
  s4.addText(w.stops, {
    x: 1.1, y: y + 0.5, w: 5.5, h: 0.35,
    fontSize: 11, fontFace: BODY_FONT, color: GRAY, margin: 0,
  });
  s4.addText(w.time, {
    x: 7, y: y + 0.12, w: 2, h: 0.35,
    fontSize: 13, fontFace: BODY_FONT, color: GOLD, align: "right", margin: 0,
  });
  s4.addText("Visit Sarajevo", {
    x: 7, y: y + 0.5, w: 2, h: 0.35,
    fontSize: 10, fontFace: BODY_FONT, color: GOLD_DIM, align: "right", margin: 0,
  });
});

s4.addText("Svaka stanica prikazuje vaš opis, fotografiju objekta, vrijeme pješačenja i savjete šta pogledati", {
  x: 0.8, y: 5, w: 8.4, h: 0.4,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, italic: true, margin: 0,
});

// =============================================
// SLIDE 5 — FEATURE: ASK SARAJEVO
// =============================================
const s5 = pres.addSlide();
s5.background = { color: DARK };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s5.addText("Pitaj Sarajevo — AI konksijerž", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});
s5.addText("Vještačka inteligencija koja zna sve što ste objavili na vašem sajtu", {
  x: 0.8, y: 1.1, w: 8.4, h: 0.4,
  fontSize: 14, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// Example Q&A cards
const qas = [
  { q: "Gdje je ubijen Franc Ferdinand?", a: "Na Latinskom mostu, 28. juna 1914. Gavrilo Princip je izvršio atentat na nadvojvodu — događaj koji je pokrenuo Prvi svjetski rat. Muzej je otvoren 1920." },
  { q: "Gdje jesti tradicionalnu hranu?", a: "Sarajevo nudi ašćinice (begova čorba, dolma), ćevabdžinice (ćevapi u somunu) i buregdžinice. Preporučujem Baščaršiju za autentičan doživljaj." },
  { q: "Kako doći do Vrela Bosne?", a: "Tramvaj 3 do Ilidže, zatim fijakerima ili pješice 3 km drvoredom od 726 stabala. Izvor ima preko 60 podzemnih izvora." },
];

qas.forEach((qa, i) => {
  const y = 1.8 + i * 1.15;
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 1.0, fill: { color: CARD }, shadow: makeShadow() });
  s5.addText(qa.q, {
    x: 1.1, y: y + 0.1, w: 7.8, h: 0.3,
    fontSize: 14, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0,
  });
  s5.addText(qa.a, {
    x: 1.1, y: y + 0.45, w: 7.8, h: 0.45,
    fontSize: 11, fontFace: BODY_FONT, color: GRAY, margin: 0,
  });
});

s5.addText("16 stranica vašeg sajta pretvoreno u bazu znanja \u00b7 Izvor: Visit Sarajevo", {
  x: 0.8, y: 5, w: 8.4, h: 0.4,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, italic: true, align: "center", margin: 0,
});

// =============================================
// SLIDE 6 — FEATURE: TRANSPORT + INSTAGRAM + EVENTS
// =============================================
const s6 = pres.addSlide();
s6.background = { color: DARK };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s6.addText("Još tri integracije", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});

// Card 1 — Transport
s6.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 2.7, h: 3.2, fill: { color: CARD }, shadow: makeShadow() });
s6.addText("Transport", {
  x: 0.8, y: 1.7, w: 2.7, h: 0.5,
  fontSize: 18, fontFace: BODY_FONT, color: GOLD, bold: true, align: "center", margin: 0,
});
s6.addText("Vaši podaci o tramvajima, autobusima i trolejbusima prikazani na svakom objektu.\n\nPrimjer:\nTramvaj 3 \u2192 Baščaršija\n1 min pješice", {
  x: 1.0, y: 2.3, w: 2.3, h: 2.2,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// Card 2 — Instagram
s6.addShape(pres.shapes.RECTANGLE, { x: 3.7, y: 1.5, w: 2.7, h: 3.2, fill: { color: CARD }, shadow: makeShadow() });
s6.addText("Instagram", {
  x: 3.7, y: 1.7, w: 2.7, h: 0.5,
  fontSize: 18, fontFace: BODY_FONT, color: GOLD, bold: true, align: "center", margin: 0,
});
s6.addText("Vaše Instagram objave (@visitsarajevo.ba) prikazane kao horizontalni karusel na početnom ekranu.\n\n33K+ pratilaca\nSvaki post dostiže turiste u aplikaciji", {
  x: 3.9, y: 2.3, w: 2.3, h: 2.2,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// Card 3 — Events
s6.addShape(pres.shapes.RECTANGLE, { x: 6.6, y: 1.5, w: 2.7, h: 3.2, fill: { color: CARD }, shadow: makeShadow() });
s6.addText("Događaji", {
  x: 6.6, y: 1.7, w: 2.7, h: 0.5,
  fontSize: 18, fontFace: BODY_FONT, color: GOLD, bold: true, align: "center", margin: 0,
});
s6.addText("Vaši događaji sa visitsarajevo.ba automatski se pojavljuju u aplikaciji.\n\nSvaki put kad objavite novi događaj, Look ga preuzme u roku od nekoliko sati.", {
  x: 6.8, y: 2.3, w: 2.3, h: 2.2,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

s6.addText("Svi podaci atribuirani — \"Izvor: Visit Sarajevo\" prikazan na svakom elementu", {
  x: 0.8, y: 5, w: 8.4, h: 0.4,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, italic: true, align: "center", margin: 0,
});

// =============================================
// SLIDE 7 — VISITOR PASSPORT
// =============================================
const s7 = pres.addSlide();
s7.background = { color: DARK };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s7.addText("Sarajevo Pasoš", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});
s7.addText("Gamifikacija koja pokreće duže boravke i ponovne posjete", {
  x: 0.8, y: 1.1, w: 8.4, h: 0.4,
  fontSize: 14, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// Passport stamps grid
const attractions = [
  "Baščaršija", "Vijećnica", "Latinski most", "Tunel spasa", "Evropski Jeruzalem",
  "Bijambare", "Bjelašnica", "Skakavac", "Vrelo Bosne", "Lukomir",
];

attractions.forEach((name, i) => {
  const col = i % 5;
  const row = Math.floor(i / 5);
  const x = 0.8 + col * 1.8;
  const y = 1.8 + row * 1.6;

  s7.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.6, h: 1.3, fill: { color: CARD }, shadow: makeShadow() });
  s7.addText("\u2606", {
    x, y: y + 0.1, w: 1.6, h: 0.6,
    fontSize: 28, fontFace: BODY_FONT, color: GOLD, align: "center", margin: 0,
  });
  s7.addText(name, {
    x, y: y + 0.75, w: 1.6, h: 0.4,
    fontSize: 10, fontFace: BODY_FONT, color: WHITE, align: "center", margin: 0,
  });
});

s7.addText([
  { text: "Posjeti lokaciju \u2192 Osvoji pečat \u2192 Sakupi svih 10 \u2192 Postani ", options: { color: GRAY } },
  { text: "Sarajevo Explorer", options: { color: GOLD, bold: true } },
], {
  x: 0.8, y: 5, w: 8.4, h: 0.4,
  fontSize: 13, fontFace: BODY_FONT, align: "center", margin: 0,
});

// =============================================
// SLIDE 8 — AI POWERED BY VISIT SARAJEVO
// =============================================
const s8 = pres.addSlide();
s8.background = { color: DARK };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s8.addText("\"Na osnovu podataka Visit Sarajevo\"", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 28, fontFace: TITLE_FONT, color: GOLD, italic: true, margin: 0,
});
s8.addText("Vaš brend prisutan na svakoj AI-generisanoj preporuci", {
  x: 0.8, y: 1.1, w: 8.4, h: 0.4,
  fontSize: 14, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

const aiFeatures = [
  { title: "AI Planer", desc: "Generiše večernje planove koristeći vaše objekte i događaje. Svaki plan nosi atribuciju Visit Sarajevo." },
  { title: "Iznenadi me", desc: "Spontani mikro-planovi od 2-3 stanice. Koristi vaše top atrakcije i opise." },
  { title: "Pametna pretraga", desc: "Turisti pitaju \"Gdje jesti burek?\" — AI odgovara iz vaših kategorija (ašćinice, buregdžinice, ćevabdžinice)." },
  { title: "Gradski puls", desc: "Dnevni AI sažetak šta se dešava u Sarajevu. Uključuje vaše događaje i turističke podatke." },
];

aiFeatures.forEach((f, i) => {
  const y = 1.8 + i * 0.9;
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.75, fill: { color: CARD }, shadow: makeShadow() });
  s8.addText(f.title, {
    x: 1.1, y: y + 0.1, w: 2.5, h: 0.55,
    fontSize: 15, fontFace: BODY_FONT, color: GOLD, bold: true, valign: "middle", margin: 0,
  });
  s8.addText(f.desc, {
    x: 3.5, y: y + 0.1, w: 5.4, h: 0.55,
    fontSize: 12, fontFace: BODY_FONT, color: GRAY, valign: "middle", margin: 0,
  });
});

// =============================================
// SLIDE 9 — WHAT'S IN IT FOR THEM
// =============================================
const s9 = pres.addSlide();
s9.background = { color: DARK };
s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s9.addText("Šta dobijate?", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});

const benefits = [
  { title: "Vaš sadržaj dostiže turiste", desc: "Umjesto da se nadaju da će neko posjetiti vaš sajt, turisti nalaze vaš sadržaj tamo gdje ga trebaju — na ulici, u kafiću, dok planiraju večer." },
  { title: "Brend prisutan u svakom trenutku", desc: "Visit Sarajevo logo u zaglavlju, atribucija na svakoj AI preporuci, svaka šetnja, svaki opis — vaš brend." },
  { title: "Duge posjete, ponovni dolasci", desc: "Sarajevo Pasoš motiviše turiste da posjete svih 10 atrakcija. Heritage šetnje ih drže duže u gradu." },
  { title: "Zero effort", desc: "Vaš postojeći sadržaj već živi u aplikaciji. Svaki novi događaj koji objavite automatski se pojavljuje." },
];

benefits.forEach((b, i) => {
  const y = 1.5 + i * 1.0;
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.85, fill: { color: CARD }, shadow: makeShadow() });
  s9.addText(b.title, {
    x: 1.1, y: y + 0.08, w: 3, h: 0.35,
    fontSize: 15, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0,
  });
  s9.addText(b.desc, {
    x: 1.1, y: y + 0.42, w: 7.8, h: 0.35,
    fontSize: 12, fontFace: BODY_FONT, color: GRAY, margin: 0,
  });
});

// =============================================
// SLIDE 10 — ROADMAP: WHAT'S COMING
// =============================================
const s10 = pres.addSlide();
s10.background = { color: DARK };
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s10.addText("Šta dolazi sljedeće", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});
s10.addText("Funkcionalnosti u razvoju — sve uključuje vaš brend", {
  x: 0.8, y: 1.1, w: 8.4, h: 0.4,
  fontSize: 14, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

const roadmapItems = [
  { phase: "Q2", title: "Instagram karusel", desc: "Vaše @visitsarajevo.ba objave prikazane na početnom ekranu — svaki post dostiže turiste direktno u aplikaciji." },
  { phase: "Q2", title: "Klikabilni AI planovi", desc: "Svaka stanica u AI planu postaje klikabilna — otvara detalje objekta sa fotografijom, recenzijama, satnicom i navigacijom." },
  { phase: "Q2", title: "Živi signali gužve", desc: "\"Ko je ovdje?\" brojači na svakom objektu. Trending Now sekcija pokazuje objekte sa najvećom aktivnošću." },
  { phase: "Q3", title: "Odbrojavanje do događaja", desc: "\"Počinje za 45 min\" bedževi na događajima. Urgentnost pokreće akciju." },
  { phase: "Q3", title: "\"Upravo sada\" mod", desc: "Filter koji pokazuje samo objekte koji su SADA otvoreni, sortirane po popularnosti ili udaljenosti." },
  { phase: "Q3", title: "Automatski scraping", desc: "Vaši događaji sa visitsarajevo.ba automatski se pojavljuju u Look-u — bez ikakvog rada s vaše strane." },
];

roadmapItems.forEach((item, i) => {
  const y = 1.7 + i * 0.62;
  s10.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.52, fill: { color: CARD }, shadow: makeShadow() });
  s10.addText(item.phase, {
    x: 1.0, y: y + 0.06, w: 0.6, h: 0.4,
    fontSize: 11, fontFace: BODY_FONT, color: DARK, bold: true, align: "center", valign: "middle", margin: 0,
  });
  s10.addShape(pres.shapes.RECTANGLE, { x: 0.95, y: y + 0.08, w: 0.55, h: 0.36, fill: { color: GOLD } });
  s10.addText(item.phase, {
    x: 0.95, y: y + 0.08, w: 0.55, h: 0.36,
    fontSize: 10, fontFace: BODY_FONT, color: DARK, bold: true, align: "center", valign: "middle", margin: 0,
  });
  s10.addText(item.title, {
    x: 1.7, y: y + 0.04, w: 2.5, h: 0.22,
    fontSize: 13, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0,
  });
  s10.addText(item.desc, {
    x: 1.7, y: y + 0.26, w: 7.2, h: 0.22,
    fontSize: 10, fontFace: BODY_FONT, color: GRAY, margin: 0,
  });
});

// =============================================
// SLIDE 11 — MOCKUP: INSTAGRAM KARUSEL
// =============================================
const s11 = pres.addSlide();
s11.background = { color: DARK };
s11.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s11.addText("Visit Sarajevo Stories", {
  x: 0.8, y: 0.3, w: 5, h: 0.7,
  fontSize: 28, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});
s11.addText("Vaše Instagram objave kao interaktivni karusel na početnom ekranu", {
  x: 0.8, y: 0.9, w: 8.4, h: 0.4,
  fontSize: 13, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// Mockup: phone frame with Instagram cards
s11.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 1.6, w: 7, h: 3.5, fill: { color: "0A0A0A" }, shadow: makeShadow() });
// Section header inside mockup
s11.addText("Visit Sarajevo Stories", {
  x: 1.8, y: 1.8, w: 4, h: 0.35,
  fontSize: 14, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0,
});
// Three card placeholders
const igCards = [
  { label: "Baščaršija\nzimi", via: "via @visitsarajevo.ba" },
  { label: "Bajramska\natmosfera", via: "via @visitsarajevo.ba" },
  { label: "Sebilj pod\nsnijegom", via: "via @visitsarajevo.ba" },
  { label: "Ferhadija\nnoću", via: "via @visitsarajevo.ba" },
];
igCards.forEach((card, i) => {
  const cx = 1.9 + i * 1.6;
  s11.addShape(pres.shapes.RECTANGLE, { x: cx, y: 2.3, w: 1.4, h: 2.2, fill: { color: "2A2420" }, shadow: makeShadow() });
  // Image placeholder
  s11.addShape(pres.shapes.RECTANGLE, { x: cx, y: 2.3, w: 1.4, h: 1.4, fill: { color: "3D3530" } });
  s11.addText("📸", { x: cx, y: 2.6, w: 1.4, h: 0.7, fontSize: 24, align: "center", margin: 0 });
  // Caption
  s11.addText(card.label, {
    x: cx + 0.08, y: 3.75, w: 1.24, h: 0.4,
    fontSize: 9, fontFace: BODY_FONT, color: WHITE, margin: 0,
  });
  s11.addText(card.via, {
    x: cx + 0.08, y: 4.15, w: 1.24, h: 0.25,
    fontSize: 7, fontFace: BODY_FONT, color: GOLD_DIM, margin: 0,
  });
});

s11.addText("33K+ pratilaca → sadržaj dostiže turiste unutar aplikacije", {
  x: 0.8, y: 5.1, w: 8.4, h: 0.3,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, italic: true, align: "center", margin: 0,
});

// =============================================
// SLIDE 12 — MOCKUP: VISITOR PASSPORT
// =============================================
const s12 = pres.addSlide();
s12.background = { color: DARK };
s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s12.addText("Sarajevo Pasoš", {
  x: 0.8, y: 0.3, w: 5, h: 0.7,
  fontSize: 28, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});
s12.addText("Digitalni pasoš koji motiviše turiste da posjete sve vaše atrakcije", {
  x: 0.8, y: 0.9, w: 8.4, h: 0.4,
  fontSize: 13, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// Mockup: passport screen
s12.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 1.5, w: 7, h: 3.8, fill: { color: "0A0A0A" }, shadow: makeShadow() });

// Progress bar mockup
s12.addText("3/10 pečata", {
  x: 1.8, y: 1.7, w: 3, h: 0.3,
  fontSize: 12, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0,
});
s12.addShape(pres.shapes.RECTANGLE, { x: 1.8, y: 2.05, w: 6.4, h: 0.15, fill: { color: "2A2420" } });
s12.addShape(pres.shapes.RECTANGLE, { x: 1.8, y: 2.05, w: 1.92, h: 0.15, fill: { color: GOLD } });

// Stamp grid mockup
const stampData = [
  { name: "Baščaršija", earned: true },
  { name: "Vijećnica", earned: true },
  { name: "Latinski most", earned: true },
  { name: "Tunel spasa", earned: false },
  { name: "Evr. Jeruzalem", earned: false },
  { name: "Bijambare", earned: false },
  { name: "Bjelašnica", earned: false },
  { name: "Skakavac", earned: false },
  { name: "Vrelo Bosne", earned: false },
  { name: "Lukomir", earned: false },
];

stampData.forEach((stamp, i) => {
  const col = i % 5;
  const row = Math.floor(i / 5);
  const sx = 1.9 + col * 1.3;
  const sy = 2.5 + row * 1.3;

  s12.addShape(pres.shapes.RECTANGLE, {
    x: sx, y: sy, w: 1.1, h: 1.05,
    fill: { color: stamp.earned ? "2A2015" : "1A1A1A" },
    shadow: makeShadow(),
  });
  s12.addText(stamp.earned ? "★" : "☆", {
    x: sx, y: sy + 0.05, w: 1.1, h: 0.55,
    fontSize: 22, align: "center", color: stamp.earned ? GOLD : "444444", margin: 0,
  });
  s12.addText(stamp.name, {
    x: sx, y: sy + 0.6, w: 1.1, h: 0.35,
    fontSize: 8, fontFace: BODY_FONT, color: stamp.earned ? WHITE : "666666", align: "center", margin: 0,
  });
});

// Bottom text
s12.addText([
  { text: "Posjeti → Osvoji pečat → Sakupi 10 → ", options: { color: GRAY } },
  { text: "Sarajevo Explorer", options: { color: GOLD, bold: true } },
], {
  x: 0.8, y: 5.1, w: 8.4, h: 0.3,
  fontSize: 12, fontFace: BODY_FONT, align: "center", margin: 0,
});

// =============================================
// SLIDE 13 — MOCKUP: CLICKABLE AI STOPS + LIVE SIGNALS
// =============================================
const s13 = pres.addSlide();
s13.background = { color: DARK };
s13.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

s13.addText("Klikabilni planovi + živi signali", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.7,
  fontSize: 28, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});
s13.addText("AI planovi postaju interaktivni, objekti pokazuju aktivnost u realnom vremenu", {
  x: 0.8, y: 0.9, w: 8.4, h: 0.4,
  fontSize: 13, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

// Left mockup: clickable plan stop
s13.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.6, w: 4.2, h: 3.5, fill: { color: "0A0A0A" }, shadow: makeShadow() });
s13.addText("AI Plan — klikabilne stanice", {
  x: 1.0, y: 1.75, w: 3.8, h: 0.3,
  fontSize: 11, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0,
});

// Plan stop card
s13.addShape(pres.shapes.RECTANGLE, { x: 1.1, y: 2.2, w: 3.7, h: 1.1, fill: { color: CARD }, shadow: makeShadow() });
s13.addText("18:30", { x: 1.3, y: 2.3, w: 0.8, h: 0.25, fontSize: 11, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0 });
s13.addText("Dveri", { x: 1.3, y: 2.55, w: 2, h: 0.25, fontSize: 14, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0 });
s13.addText("Tradicionalna bosanska večera", { x: 1.3, y: 2.8, w: 3, h: 0.2, fontSize: 10, fontFace: BODY_FONT, color: GRAY, margin: 0 });
// Arrow indicating clickability
s13.addText("TAP →  otvara detalje objekta", { x: 1.3, y: 3.05, w: 3, h: 0.2, fontSize: 9, fontFace: BODY_FONT, color: GOLD, italic: true, margin: 0 });

// Expanded venue preview
s13.addShape(pres.shapes.RECTANGLE, { x: 1.1, y: 3.5, w: 3.7, h: 1.3, fill: { color: "252015" }, shadow: makeShadow() });
s13.addShape(pres.shapes.RECTANGLE, { x: 1.1, y: 3.5, w: 1.2, h: 1.3, fill: { color: "3D3530" } });
s13.addText("📸", { x: 1.1, y: 3.8, w: 1.2, h: 0.6, fontSize: 20, align: "center", margin: 0 });
s13.addText("Dveri", { x: 2.4, y: 3.6, w: 2, h: 0.25, fontSize: 12, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0 });
s13.addText("★ 4.8  ·  Restoran", { x: 2.4, y: 3.85, w: 2, h: 0.2, fontSize: 9, fontFace: BODY_FONT, color: GOLD, margin: 0 });
s13.addText("Kujundžiluk 5, Baščaršija", { x: 2.4, y: 4.05, w: 2, h: 0.2, fontSize: 9, fontFace: BODY_FONT, color: GRAY, margin: 0 });
s13.addText("Navigiraj   Pozovi   Sačuvaj", { x: 2.4, y: 4.35, w: 2.2, h: 0.2, fontSize: 9, fontFace: BODY_FONT, color: GOLD, margin: 0 });

// Right mockup: live crowd signals
s13.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.6, w: 4.2, h: 3.5, fill: { color: "0A0A0A" }, shadow: makeShadow() });
s13.addText("Živi signali gužve", {
  x: 5.4, y: 1.75, w: 3.8, h: 0.3,
  fontSize: 11, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0,
});

// Trending venue cards
const trendingVenues = [
  { name: "Zlatna ribica", count: "23 ovdje", trend: "🔥" },
  { name: "Hacienda", count: "18 ovdje", trend: "🔥" },
  { name: "Café Tito", count: "12 ovdje", trend: "↑" },
  { name: "Kino Bosna", count: "Počinje za 45 min", trend: "⏰" },
];

trendingVenues.forEach((v, i) => {
  const vy = 2.2 + i * 0.7;
  s13.addShape(pres.shapes.RECTANGLE, { x: 5.4, y: vy, w: 3.8, h: 0.55, fill: { color: CARD }, shadow: makeShadow() });
  s13.addText(v.trend, { x: 5.5, y: vy + 0.05, w: 0.4, h: 0.45, fontSize: 16, align: "center", margin: 0 });
  s13.addText(v.name, { x: 6.0, y: vy + 0.05, w: 1.8, h: 0.25, fontSize: 12, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0 });
  s13.addText(v.count, { x: 6.0, y: vy + 0.28, w: 1.8, h: 0.2, fontSize: 9, fontFace: BODY_FONT, color: GRAY, margin: 0 });
});

s13.addText("Turisti vide gdje je gužva — i idu tamo", {
  x: 0.8, y: 5.1, w: 8.4, h: 0.3,
  fontSize: 12, fontFace: BODY_FONT, color: GRAY, italic: true, align: "center", margin: 0,
});

// =============================================
// SLIDE 14 — CLOSING / CTA
// =============================================
const sFinal = pres.addSlide();
sFinal.background = { color: DARK };
sFinal.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

sFinal.addText("Sve ovo je vaš sadržaj.", {
  x: 0.8, y: 1.5, w: 8.4, h: 0.8,
  fontSize: 36, fontFace: TITLE_FONT, color: WHITE, margin: 0,
});

sFinal.addText("Mi smo ga samo učinili interaktivnim.", {
  x: 0.8, y: 2.3, w: 8.4, h: 0.6,
  fontSize: 24, fontFace: TITLE_FONT, color: GOLD, margin: 0,
});

sFinal.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.3, w: 1.5, h: 0.04, fill: { color: GOLD } });

sFinal.addText("Hajde da razgovaramo o partnerstvu.", {
  x: 0.8, y: 3.7, w: 8.4, h: 0.5,
  fontSize: 18, fontFace: BODY_FONT, color: GRAY, margin: 0,
});

sFinal.addText("hype-alpha.vercel.app", {
  x: 0.8, y: 4.8, w: 4, h: 0.4,
  fontSize: 14, fontFace: BODY_FONT, color: GOLD, margin: 0,
});

// === WRITE FILE ===
const outPath = process.argv[2] || "Look_x_VisitSarajevo_Pitch.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log(`Pitch deck created: ${outPath}`);
});
