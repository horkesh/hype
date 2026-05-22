// Global 404 (separate from per-route not-found.tsx files which already
// exist for /lokacija/[slug] and /dogadjaj/[slug]).

export default function NotFound() {
  return (
    <main style={{ padding: 48, maxWidth: 560, margin: '0 auto', textAlign: 'center', color: '#F5F5F5' }}>
      <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 64, color: '#D4A056', margin: 0 }}>
        404
      </h1>
      <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, marginTop: 8 }}>
        Stranica nije pronađena
      </h2>
      <p style={{ color: '#A1A1AA', marginTop: 12, marginBottom: 24 }}>
        Možda je premještena ili je veza pogrešna.
      </p>
      <a
        href="/"
        style={{
          background: '#D4A056',
          color: '#000',
          padding: '12px 24px',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Nazad na početnu
      </a>
    </main>
  );
}
