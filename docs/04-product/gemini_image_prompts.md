# Hype — Gemini Pro Image Generation Prompts

Generate each image with Google Gemini Pro (image generation mode). Save outputs to `assets/generated/` in the corresponding subfolder. Use the exact filenames listed — the app references them.

---

## Priority 1: Hero Backgrounds (6 images)

These are the first thing users see. Highest visual impact.

**Output:** 1920×1080, 16:9, save as `.jpg`
**Folder:** `assets/generated/heroes/`

### 1. hero_morning.jpg
```
Cinematic photograph, Baščaršija cobblestone street with a coffee cup in foreground, Sarajevo Bosnia, warm golden morning light, shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no people in focus, 1920x1080
```

### 2. hero_afternoon.jpg
```
Cinematic photograph, Old town panorama with terrace umbrellas and blue sky, Sarajevo Bosnia, bright midday sun, shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no people in focus, 1920x1080
```

### 3. hero_evening.jpg
```
Cinematic photograph, Skyline with minarets, Sarajevo Bosnia, golden hour sunset amber and pink sky, shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no people in focus, 1920x1080
```

### 4. hero_night.jpg
```
Cinematic photograph, Old town lantern-lit street with wet cobblestones, Sarajevo Bosnia, warm street lights atmospheric, shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no people in focus, 1920x1080
```

### 5. hero_tonight.jpg
```
Cinematic photograph, Neon bar signs reflecting on rain-slicked street, Sarajevo Bosnia, dramatic neon and shadow, shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no people in focus, 1920x1080
```

### 6. hero_explore.jpg
```
Cinematic photograph, Colorful market stalls with spices and textiles, Sarajevo Bosnia, bright natural daylight, shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no people in focus, 1920x1080
```

---

## Priority 2: Mood Icons (12 images)

Used in mood chip selectors on Home and Explore. Must feel cohesive as a set.

**Output:** 512×512, transparent or dark background, save as `.png`
**Folder:** `assets/generated/moods/`

### 7. mood_party.png
```
Soft glowing icon, frosted glass effect, subtle red ambient light, sparkler with confetti sparks, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 8. mood_chill.png
```
Soft glowing icon, frosted glass effect, subtle blue ambient light, crescent moon over lounge silhouette, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 9. mood_girls_night.png
```
Soft glowing icon, frosted glass effect, subtle pink ambient light, elegant cocktail glass with cherry, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 10. mood_date_night.png
```
Soft glowing icon, frosted glass effect, subtle orange ambient light, two clinking wine glasses by candlelight, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 11. mood_music.png
```
Soft glowing icon, frosted glass effect, subtle purple ambient light, over-ear headphones with sound waves, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 12. mood_romance.png
```
Soft glowing icon, frosted glass effect, subtle deep red ambient light, single red rose with soft petals, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 13. mood_culture.png
```
Soft glowing icon, frosted glass effect, subtle indigo ambient light, theatrical comedy-tragedy masks, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 14. mood_foodie.png
```
Soft glowing icon, frosted glass effect, subtle amber ambient light, steaming plate with fork and knife, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 15. mood_brunch.png
```
Soft glowing icon, frosted glass effect, subtle light pink ambient light, croissant with coffee cup, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 16. mood_after_work.png
```
Soft glowing icon, frosted glass effect, subtle brown amber ambient light, beer glass with foam, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 17. mood_outdoor.png
```
Soft glowing icon, frosted glass effect, subtle green ambient light, stylized leaf with mountain peak, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 18. mood_tourist.png
```
Soft glowing icon, frosted glass effect, subtle sky blue ambient light, compass with directional needle, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

---

## Priority 3: Category Icons (8 images)

Used as fallback icons for venue category chips and cards.

**Output:** 512×512, transparent or dark background, save as `.png`
**Folder:** `assets/generated/categories/`

### 19. cat_restaurant.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, elegant plate with cutlery arrangement, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 20. cat_bar.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, cocktail shaker pouring, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 21. cat_cafe.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, steaming coffee cup with saucer, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 22. cat_club.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, DJ turntable with spinning vinyl, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 23. cat_theatre.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, ornate stage curtain parting, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 24. cat_cinema.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, classic film reel unwinding, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 25. cat_gallery.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, framed canvas on wall, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

### 26. cat_concert.png
```
Soft glowing icon, frosted glass effect, subtle warm amber ambient light, standing microphone with spotlight, dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512
```

---

## Priority 4: Category Fallback Photography (8 images)

Used when a venue has no Google Maps photo. Bosnian aesthetic.

**Output:** 1024×768, 4:3, save as `.jpg`
**Folder:** `assets/generated/fallbacks/`

### 27. fallback_restaurant.jpg
```
Cozy restaurant interior with ćilim textiles and warm wood, table set with traditional Bosnian dishes, Bosnian aesthetic, warm inviting atmosphere, professional food and interior photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

### 28. fallback_bar.jpg
```
Atmospheric cocktail bar interior with amber lighting and glass shelves, Bosnian aesthetic, warm inviting atmosphere, professional interior photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

### 29. fallback_cafe.jpg
```
Turkish coffee set on copper tray with Baščaršija courtyard visible through window, Bosnian aesthetic, warm inviting atmosphere, professional food photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

### 30. fallback_club.jpg
```
Dark dance floor with dramatic overhead lighting and DJ booth silhouette, Bosnian aesthetic, warm inviting atmosphere, professional interior photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

### 31. fallback_theatre.jpg
```
Ornate theatre interior with red velvet seats and gilded proscenium, Bosnian aesthetic, warm inviting atmosphere, professional interior photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

### 32. fallback_cinema.jpg
```
Dark cinema auditorium with screen glow and rows of seats, Bosnian aesthetic, warm inviting atmosphere, professional interior photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

### 33. fallback_gallery.jpg
```
White-walled gallery space with dramatic spotlight on artwork, Bosnian aesthetic, warm inviting atmosphere, professional interior photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

### 34. fallback_concert.jpg
```
Concert stage with dramatic spotlights and instrument silhouettes, Bosnian aesthetic, warm inviting atmosphere, professional interior photography, no text, no faces, 4:3 aspect ratio, 1024x768
```

---

## Checklist

| # | Asset | File | Status |
|---|---|---|---|
| 1 | Hero Morning | `heroes/hero_morning.jpg` | ☐ |
| 2 | Hero Afternoon | `heroes/hero_afternoon.jpg` | ☐ |
| 3 | Hero Evening | `heroes/hero_evening.jpg` | ☐ |
| 4 | Hero Night | `heroes/hero_night.jpg` | ☐ |
| 5 | Hero Tonight | `heroes/hero_tonight.jpg` | ☐ |
| 6 | Hero Explore | `heroes/hero_explore.jpg` | ☐ |
| 7 | Mood Party | `moods/mood_party.png` | ☐ |
| 8 | Mood Chill | `moods/mood_chill.png` | ☐ |
| 9 | Mood Girls Night | `moods/mood_girls_night.png` | ☐ |
| 10 | Mood Date Night | `moods/mood_date_night.png` | ☐ |
| 11 | Mood Music | `moods/mood_music.png` | ☐ |
| 12 | Mood Romance | `moods/mood_romance.png` | ☐ |
| 13 | Mood Culture | `moods/mood_culture.png` | ☐ |
| 14 | Mood Foodie | `moods/mood_foodie.png` | ☐ |
| 15 | Mood Brunch | `moods/mood_brunch.png` | ☐ |
| 16 | Mood After Work | `moods/mood_after_work.png` | ☐ |
| 17 | Mood Outdoor | `moods/mood_outdoor.png` | ☐ |
| 18 | Mood Tourist | `moods/mood_tourist.png` | ☐ |
| 19 | Cat Restaurant | `categories/cat_restaurant.png` | ☐ |
| 20 | Cat Bar | `categories/cat_bar.png` | ☐ |
| 21 | Cat Cafe | `categories/cat_cafe.png` | ☐ |
| 22 | Cat Club | `categories/cat_club.png` | ☐ |
| 23 | Cat Theatre | `categories/cat_theatre.png` | ☐ |
| 24 | Cat Cinema | `categories/cat_cinema.png` | ☐ |
| 25 | Cat Gallery | `categories/cat_gallery.png` | ☐ |
| 26 | Cat Concert | `categories/cat_concert.png` | ☐ |
| 27 | Fallback Restaurant | `fallbacks/fallback_restaurant.jpg` | ☐ |
| 28 | Fallback Bar | `fallbacks/fallback_bar.jpg` | ☐ |
| 29 | Fallback Cafe | `fallbacks/fallback_cafe.jpg` | ☐ |
| 30 | Fallback Club | `fallbacks/fallback_club.jpg` | ☐ |
| 31 | Fallback Theatre | `fallbacks/fallback_theatre.jpg` | ☐ |
| 32 | Fallback Cinema | `fallbacks/fallback_cinema.jpg` | ☐ |
| 33 | Fallback Gallery | `fallbacks/fallback_gallery.jpg` | ☐ |
| 34 | Fallback Concert | `fallbacks/fallback_concert.jpg` | ☐ |
