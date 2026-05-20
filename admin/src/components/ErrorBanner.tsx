import { supabase } from '../supabase';

interface Props {
  error: string;
  onRetry?: () => void;
}

export function ErrorBanner({ error, onRetry }: Props) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.35)',
        color: '#EF4444',
        padding: '12px 16px',
        borderRadius: 8,
        marginBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        flexShrink: 0,
      }}
    >
      <div style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
        {error}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #EF4444',
              background: 'transparent',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Pokušaj ponovo
          </button>
        )}
        <button
          onClick={() => location.reload()}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #EF4444',
            background: 'transparent',
            color: '#EF4444',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Osvježi stranicu
        </button>
        <button
          onClick={handleSignOut}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            background: '#EF4444',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Odjava i ponovna prijava
        </button>
      </div>
    </div>
  );
}
