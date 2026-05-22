import { ImageResponse } from 'next/og';

// Dynamic Open Graph image generation. Routes:
//   /og?title=...&subtitle=...      → simple text card
//   /og?title=...&image=...         → with hero photo behind
//
// Renders as a 1200x630 PNG on the Edge runtime. Used by venue/event
// metadata when there's no cover_image_url; we just append /og?title=... as
// the og:image URL and Vercel caches it at the edge.

export const runtime = 'edge';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get('title')?.slice(0, 80) ?? 'Look';
  const subtitle = url.searchParams.get('subtitle')?.slice(0, 80) ?? 'Sarajevo';
  const image = url.searchParams.get('image');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: image ? '#000' : 'linear-gradient(135deg, #1a1a1a 0%, #2a1f10 100%)',
          color: '#F5F5F5',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {image && (
          <img
            src={image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            padding: '64px 80px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)',
          }}
        >
          <div style={{ fontSize: 24, color: '#D4A056', letterSpacing: 2, textTransform: 'uppercase' }}>
            Look · {subtitle}
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, marginTop: 8 }}>{title}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
