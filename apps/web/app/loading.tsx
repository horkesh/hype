// Root-level loading state — streamed in while server components fetch
// data. Per-route loading.tsx files can override this.

export default function Loading() {
  return (
    <main style={{ padding: 48, maxWidth: 1200, margin: '0 auto', minHeight: '50vh' }}>
      <div
        style={{
          height: 48,
          width: 200,
          background: '#1E1E1E',
          borderRadius: 12,
          marginBottom: 24,
          animation: 'pulse 1.4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 280,
              background: '#1E1E1E',
              borderRadius: 24,
              animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </main>
  );
}
