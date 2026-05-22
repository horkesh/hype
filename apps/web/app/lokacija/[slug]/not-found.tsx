export default function NotFound() {
  return (
    <main style={{ padding: 48, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Lokacija nije pronađena</h1>
      <p style={{ color: '#888' }}>Možda je uklonjena ili još nije objavljena.</p>
      <a href="/" style={{ color: '#D4A056', marginTop: 16, display: 'inline-block' }}>← Nazad na početnu</a>
    </main>
  );
}
