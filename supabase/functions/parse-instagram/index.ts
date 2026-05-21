import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { verifyAdminAuth } from '../_shared/auth.ts';

const SARAJEVO_DATE_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Sarajevo',
  year: 'numeric', month: '2-digit', day: '2-digit',
});

function sarajevoToday(): string {
  return SARAJEVO_DATE_FMT.format(new Date());
}

// Anything older than 24h before "now" is considered past — same window as the
// promoteEvents guard so the edge function and the promoter agree.
function isPastDate(date: string | null): boolean {
  if (!date) return false;
  const t = Date.parse(date);
  if (Number.isNaN(t)) return false;
  return t < Date.now() - 24 * 60 * 60 * 1000;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  if (!verifyAdminAuth(req)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Admin authentication required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { caption, account_name, post_url, image_url, post_timestamp } = await req.json();
    if (!caption) {
      return new Response(JSON.stringify({ success: false, error: 'Missing caption' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const today = sarajevoToday();
    const postedLine = post_timestamp ? `Post was published: ${post_timestamp}` : '';

    const result = await callClaude({
      model: 'claude-haiku-4-5-20251001',
      messages: [{
        role: 'user',
        content: `Analyze this Instagram post caption from a Sarajevo venue/event account.

Account: @${account_name ?? 'unknown'}
Today's date (Sarajevo): ${today}
${postedLine}
Caption: "${caption}"

CRITICAL — this is an UPCOMING events feed. Only return is_event=true if the caption announces a SPECIFIC, USER-FACING event happening in the FUTURE (today onward in Sarajevo). Be aggressively skeptical — when in doubt, reject.

REJECT (is_event=false):

1. PAST EVENTS — any post about something that already happened:
   - Throwback / recap / "remember when" / anniversary-of posts
   - Memory or nostalgia posts ("3 years ago today", "ovaj dan prije X godina")
   - Past-tense narration even without explicit "throwback" wording:
     • Bosnian past tense: "održan je", "održana je", "otvorena je", "otvoreno je", "bilo je", "bio je", "bila je", "imali smo", "uživali smo", "hvala svima koji su došli"
     • English past tense: "was held", "we celebrated", "thanks to everyone who came", "what a night", "amazing turnout"
   - If the caption's verbs are dominantly past tense and the date discussed is the past event itself, the event already happened → reject.

2. CALL-FOR-X / REGISTRATION / ADMINISTRATIVE posts — NOT user-facing events:
   - "Otvorene su prijave za..." / "Call for papers" / "Call for projects" / "Call for submissions"
   - "Prijavi se kao volonter" / "Volunteer registration"
   - "100 dana do festivala" / "100 days to" countdown posts without a specific date
   - "Predstavljamo X projekte odabrane za..." / "Introducing N projects selected for..."
   - Industry-only events (producers' labs, training programmes, festival pre-events for crew)
   - Award nominee announcements (the ceremony might be an event; the announcement post isn't)

3. BEHIND-THE-SCENES / SOUNDCHECK / REHEARSAL photos posted DURING a festival or event:
   - Captions containing "#soundcheck", "soundcheck", "rehearsal", "proba", "iza scene", "behind the scenes"
   - Photos with just an artist/band name + a festival hashtag + a credit line ("photo by @x") — these are content posted DURING the festival, not announcements of future shows
   - Press photos / album drops / music video releases

4. GENERIC PROMO without a specific upcoming date:
   - Vibe posts ("Vidimo se vikend!" with no date)
   - Menu announcements, opening hours, "we're open today"
   - Job ads, hiring posts
   - Generic artist mentions with no event context ("X u režiji Y ✨" — no date, no venue, no time)

ACCEPT (is_event=true) only when ALL of these hold:
- The caption announces a SPECIFIC event the public can attend
- The event date is in the future (today onward Sarajevo time)
- Either the date OR the title is concrete enough to be useful (ideally both)

DATE EXTRACTION:
- If the caption mentions a date but no year, assume the next future occurrence (e.g. "27. Maj" in May 2026 means 2026-05-27; "27. Maj" in June 2026 means 2027-05-27).
- NEVER invent a year from context — if the date is ambiguous or past, set is_event=false.
- "📅" emoji often introduces the date. "📍" often introduces the venue.

CONFIDENCE:
- "high" = explicit future date + venue + event name in the caption
- "medium" = some signal missing (e.g. date implicit, venue inferred from account)
- "low" = significant uncertainty
Only set is_event=true at high or medium. Reject at low.

Return JSON only:
{
  "is_event": true/false,
  "title": "event name" or null,
  "date": "YYYY-MM-DD" or null,
  "time": "HH:MM" or null,
  "venue_name": "venue name" or null,
  "price": "price string" or null,
  "description_bs": "brief Bosnian description" or null,
  "description_en": "brief English description" or null,
  "moods": ["relevant mood ids"] or [],
  "category": "event category" or null,
  "confidence": "high" | "medium" | "low",
  "rejection_reason": "throwback" | "past_tense_recap" | "call_for_x" | "behind_scenes" | "no_specific_date" | "generic_promo" | null
}`,
      }],
      system: `You extract structured UPCOMING event data from Instagram captions for a Sarajevo events platform. You aggressively reject throwback, recap, administrative, behind-the-scenes, and generic-promo posts. Return valid JSON only.`,
      max_tokens: 512,
    });

    const text = result.content?.[0]?.text ?? '';
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed;
    try { parsed = JSON.parse(clean); } catch { parsed = { is_event: false, confidence: 'low' }; }

    // Defense-in-depth: even if Haiku says is_event=true, drop it if the
    // extracted date is in the past. Catches throwback posts the prompt missed.
    let rejectedAsPast = false;
    if (parsed.is_event && isPastDate(parsed.date)) {
      rejectedAsPast = true;
      parsed.is_event = false;
      parsed.rejected_reason = 'past_date';
    }

    // Confidence filter: medium-confidence rows have ~0 signal in practice
    // (#soundcheck, generic artist mentions, no-date calls). Only ingest
    // high-confidence rows; medium becomes a no-op pass-through.
    let rejectedLowConfidence = false;
    if (parsed.is_event && parsed.confidence !== 'high') {
      rejectedLowConfidence = true;
      parsed.is_event = false;
      parsed.rejected_reason = parsed.rejected_reason ?? 'low_confidence';
    }

    if (parsed.is_event && parsed.title) {
      await supabaseAdmin.from('raw_events').insert({
        title_raw: parsed.title,
        description_raw: [parsed.description_bs, parsed.description_en].filter(Boolean).join(' / ') || caption.slice(0, 500),
        date_raw: [parsed.date, parsed.time].filter(Boolean).join(' ') || null,
        venue_raw: parsed.venue_name,
        venue_name_raw: parsed.venue_name,
        image_url: image_url ?? null,
        source_name: `instagram:@${account_name ?? 'unknown'}`,
        source_url: post_url ?? null,
        raw_json: {
          instagram_account: account_name,
          caption: caption.slice(0, 2000),
          parsed_event: parsed,
          extracted_by: 'parse-instagram-edge-function',
        },
        parsed: true,
        parsed_at: new Date().toISOString(),
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data: parsed,
      rejected_as_past: rejectedAsPast,
      rejected_low_confidence: rejectedLowConfidence,
    }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
