# Visit Sarajevo — Integration into Look

## Goal

When pitching to the tourism board, they should see their own content, data, and brand already living inside Look — transformed into something their website can't do. The reaction should be: "it can do THAT?!"

---

## What they have (examined in detail)

### Website content
- **Top Attractions**: Baščaršija & Sebilj, City Hall, Latin Bridge/Assassination Museum, Tunnel of Salvation, European Jerusalem, Bijambare Caves, Bjelašnica & Igman, Skakavac Waterfall, Spring of Bosna, Lukomir Village
- **Places to Eat**: categorized as Restaurants, Ašćinice, Ćevabdžinice, Buregdžinice, Bakeries, Pastry Shops, Fast Food
- **Sightseeing themes**: Ottoman Empire, Austro-Hungarian, Yugoslavia, Olympics, Under Siege, Weekend Guide
- **Events calendar**: 3 events currently (Skroz concert, Enis Bešlagić show, KOIKOI)
- **News**: Travel fair appearances (ITB Berlin, BIT Milano, EMITT Istanbul), tourism statistics, cultural events
- **Transport info**: Tram, Bus, Trolleybus, Taxi, Car/Bike/Scooter rental

### Social media
- **Instagram** (@visitsarajevo.ba): 33K+ followers, daily posts — city photography, events, Ramadan content, concert promotions
- **Facebook**: 33,251 followers, regular event and news posts
- **YouTube**: present but not prominent
- **Hashtag**: #visitsarajevo

### Branding
- Slogan: "Sarajevo — Feel Where Cultures Embrace"
- Sub-brands: "Feel", "Enjoy", "Visit", "Discover"
- Visual identity: blue/yellow/orange, colorful SA pin logo

---

## Integration features — what to build

### 1. "Visit Sarajevo Stories" rail on Home

Pull their Instagram feed directly into a horizontal card rail on the Home screen. Not just embedding — transform each post into a glass card with the image, a short caption, and a "via @visitsarajevo.ba" attribution.

**Why it's a wow**: They spend money creating Instagram content. Show them it can reach tourists inside the app, not just people who follow them on Instagram. Their content becomes discovery fuel.

**How**: Use Apify Instagram scraper (already built) pointed at `@visitsarajevo.ba`. Parse captions for venue/event mentions, auto-link to our venue DB.

### 2. "Heritage Walk" AI mode — their sightseeing themes as interactive tours

Their site lists sightseeing by historical era (Ottoman, Austro-Hungarian, etc.) as static text pages. Turn each into an **AI-guided walking tour**:

- User taps "Ottoman Sarajevo" → AI generates a timed walking route: Sebilj → Baščaršija → Gazi Husrev-bey Mosque → Morića Han → Brusa Bezistan
- Each stop shows: Visit Sarajevo's description (attributed), our venue photo, walking time to next stop, what to look for
- Live map with the route drawn
- "Share this walk" generates a branded card with the Visit Sarajevo logo

**Why it's a wow**: Their best content (the rich historical descriptions from the attractions page) suddenly becomes an interactive, timed, shareable experience that a tourist can follow in real time. Their static website pages can't do that.

**How**: Seed a `heritage_walks` table with their attraction data. Build a `HeritageTourScreen` that renders stops with AI-enriched walking directions. Reuse the `TonightPlanStream` pattern.

### 3. "Ask Sarajevo" — AI trained on their entire website

An AI concierge that knows everything Visit Sarajevo has published. Tourist asks "What's the story behind the Latin Bridge?" → gets the full assassination history from their content, plus "Tap to navigate there" linked to our venue detail.

**Why it's a wow**: They wrote hundreds of pages of content about Sarajevo. Nobody reads it all. But an AI that has digested it all can answer any question a tourist asks — instantly, conversationally, in their language. Show them a tourist asking "Where should I eat traditional food?" and the AI answering with ašćinice and ćevabdžinice from THEIR Places to Eat category, linked to venues in our DB.

**How**: Scrape their site content into a knowledge base. Build a `ask-sarajevo` edge function that uses RAG (or just a large system prompt with their content) to answer questions. Wire it to the Explore smart search.

### 4. "Sarajevo Now" — live city pulse with their branding

Our City Pulse already generates AI content about what's happening. Enhance it with Visit Sarajevo attribution:

- "Based on data from Visit Sarajevo and 1,226 local venues"
- Include their events in the pulse: "Tonight: Skroz concert at Sloga (via Visit Sarajevo)"
- Show their tourism stats: "21.4% more visitors this year"

**Why it's a wow**: Their press releases talk about tourism growth numbers. Show those numbers living in the app, in context, alongside real-time venue data.

### 5. "Transport to Venue" — their transport data on every venue

They have detailed info on trams, buses, trolleybuses. Add a "How to get here" section on every venue detail screen:

- "Tram 3 to Baščaršija, walk 3 min"
- "Bus 31e to Ilidža, walk to Vrelo Bosne"

**Why it's a wow**: They maintain transport info as static text pages. Show it contextually — every venue, every AI plan stop, every heritage walk stop has transport directions attached. Their data becomes useful at the moment of need.

### 6. "Visitor Passport" — gamification with their attractions

Create a digital passport where tourists collect stamps by visiting their Top Attractions. Sebilj, City Hall, Latin Bridge, Tunnel, European Jerusalem, etc.

- Check in at a location → earn the stamp
- Complete a heritage walk → earn a gold badge
- Visit all 10 top attractions → unlock "Sarajevo Explorer" achievement
- Share your passport → branded card with Visit Sarajevo logo

**Why it's a wow**: Gamification drives repeat visits and longer stays — exactly what the tourism board wants. And every shared passport card is free marketing for Visit Sarajevo.

### 7. Their events as a scrape source

Add `visitsarajevo.ba/latest-events/` to our scraper pipeline. Their events have: title, venue name, date, category (Music, Culture), phone number, event details link.

**Why it's a wow**: "Your events are already in our app, automatically. Every time you post an event on your website, it appears in Look within hours."

---

## Demo script (suggested order)

1. Open Look → show Visit Sarajevo logo in header, tap it → opens their website
2. Show Home screen → point out "Visit Sarajevo Stories" rail with their Instagram content
3. Tap a mood → show the unified feed with their Top Attractions venues
4. Open AI Planner → generate a plan that includes their attractions → "Powered by Visit Sarajevo"
5. Show "Heritage Walk: Ottoman Sarajevo" → interactive timed tour using their content
6. Open "Ask Sarajevo" → ask "Where was Franz Ferdinand assassinated?" → AI answers from their content, links to Latin Bridge in our DB
7. Show venue detail → "How to get here: Tram 3" from their transport data
8. Show the Visitor Passport → stamps for their Top 10 attractions
9. End with: "All of this is your content. We just made it interactive."

---

## Quick wins (buildable before the pitch)

| Feature | Effort | Impact |
|---------|--------|--------|
| Instagram rail on Home (their posts) | Medium | High — they see their content in the app |
| Their events as scrape source | Low | Medium — more events, attributed to them |
| Heritage Walk seed data | Medium | Very High — the "wow" moment |
| "Powered by Visit Sarajevo" on AI plans | Trivial | High — brand attribution |
| Transport directions on venues | Medium | Medium — practical, shows depth |
| Visitor Passport / stamps | High | Very High — gamification story |
| "Ask Sarajevo" RAG concierge | High | Very High — the "it can do THAT?!" moment |
