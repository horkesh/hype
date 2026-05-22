export default function NotFound() {
  return (
    <main style={{ padding: 48, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Događaj nije pronađen</h1>
      <p style={{ color: '#888' }}>Možda je otkazan, već je prošao ili još nije objavljen.</p>
      <a href="/dogadjaji" style={{ color: '#D4A056', marginTop: 16, display: 'inline-block' }}>
        ← Vidi sve događaje
      </a>
    </main>
  );
}
