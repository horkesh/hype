# Napkin — Persistent Mistake Memory

## Learned Patterns

### AI Content Generation
- Veo 3 video: MUST specify exact hand positions per frame, or AI generates extra fingers/objects
- Always use negative constraints ("NO fork in left hand") alongside positive ones
- App UI screenshots: AI cannot reliably generate realistic mobile interfaces — use screen recordings

### Document Generation
- SVG infographics: must convert to PNG via cairosvg before embedding in docx
- ImageRun in docx-js needs type:"png" and explicit transformation dimensions
- Always generate at 2x scale for retina quality

### Database
- PostGIS: use geography type, not geometry, for GPS coordinates
- RLS: always enable on new tables BEFORE inserting data
- Supabase free tier: 500MB database, 50K auth users

### Naming
- Project went through: MahaLife → Mahala → FOMO → Hype
- Always check all files for old brand names when rebranding
- "Mahala" is also a Bosnian word (neighborhood) — don't blindly replace in content text
