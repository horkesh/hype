import { useRef, useState } from 'react';
import { supabase } from '../supabase';

interface Props {
  // Storage object path within the bucket — typically `${venueId}.jpg`.
  pathPrefix: string;
  // Current public URL (if any) to preview.
  currentUrl: string | null;
  // Called after successful upload with the new public URL. Caller persists
  // it onto the venue/event row.
  onUploaded: (publicUrl: string) => void;
  // Bucket name. Defaults to venue-photos for venues.
  bucket?: string;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — matches bucket file_size_limit

export function ImageUpload({ pathPrefix, currentUrl, onUploaded, bucket = 'venue-photos' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [draftUrl, setDraftUrl] = useState<string | null>(null);

  const upload = async (file: File) => {
    setErr(null);
    if (!file.type.startsWith('image/')) {
      setErr('Datoteka mora biti slika.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr(`Slika je prevelika (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB).`);
      return;
    }
    setBusy(true);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const objectPath = `${pathPrefix}.${ext}`;
    const { error: upError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, file, { upsert: true, contentType: file.type });
    if (upError) {
      setErr(upError.message);
      setBusy(false);
      return;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    // Cache-bust so the editor sees the new bytes immediately.
    const url = `${pub.publicUrl}?t=${Date.now()}`;
    setDraftUrl(url);
    onUploaded(url);
    setBusy(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void upload(f);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  };

  const display = draftUrl ?? currentUrl;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        border: '2px dashed rgba(212,160,86,0.25)',
        borderRadius: 10,
        padding: 12,
        background: 'rgba(212,160,86,0.03)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}
    >
      {display ? (
        <img
          src={display}
          alt="cover"
          style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
        />
      ) : (
        <div style={{
          width: 88, height: 88, borderRadius: 8, background: '#2A2A2A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#666', fontSize: 24, flexShrink: 0,
        }}>📷</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 6 }}>
          Prevuci sliku ovdje ili klikni dugme. JPG/PNG, max 5 MB.
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="page-btn"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            {busy ? 'Slanje...' : (display ? 'Zamijeni' : 'Učitaj')}
          </button>
          {err && <span className="error" style={{ fontSize: 11 }}>{err}</span>}
          {draftUrl && !err && <span className="success" style={{ fontSize: 11 }}>Spremno za snimanje</span>}
        </div>
      </div>
    </div>
  );
}
