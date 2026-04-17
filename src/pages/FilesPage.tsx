import { useRef, useState } from 'react';
import { useUploadedFilesWebStore } from '../store/useUploadedFilesWebStore';
import { BRAND_LOGO_ALT, BRAND_SITE_URL, ECHO_FIVES_LOGO_SRC } from '../brand';

function formatBytes(n: number): string {
  if (n == null || Number.isNaN(n)) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FilesPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, hydrated, addFile, removeFile, downloadFile, storageError } = useUploadedFilesWebStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onPick = async () => {
    setMessage(null);
    inputRef.current?.click();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Snapshot selected file before resetting the input value.
    const selected = e.target.files?.[0] ?? null;
    e.target.value = '';
    setBusy(true);
    const r = await addFile(selected);
    setBusy(false);
    if (!r.ok && r.message !== 'No file selected.') setMessage(r.message);
  };

  if (!hydrated) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-schedule-textMuted text-sm">Loading…</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <input ref={inputRef} type="file" className="hidden" onChange={onChange} aria-hidden />

      <div className="flex items-center gap-3 mb-4">
        <a href={BRAND_SITE_URL} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src={ECHO_FIVES_LOGO_SRC} alt={BRAND_LOGO_ALT} className="h-7 w-[100px] object-contain" />
        </a>
        <h1 className="text-xl font-bold text-schedule-text">Files</h1>
      </div>

      <p className="text-schedule-textMuted text-sm mb-4">
        Upload a file to store it in this browser (IndexedDB). The list is saved on this device only.
      </p>

      {message ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{message}</div>
      ) : null}
      {storageError ? (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          {storageError}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void onPick()}
        disabled={busy || !!storageError}
        className="w-full rounded-xl bg-schedule-accent text-white font-semibold py-3 text-sm hover:bg-schedule-accentHover disabled:opacity-60 transition-colors"
      >
        {busy ? 'Working…' : 'Upload file'}
      </button>

      <h2 className="text-sm font-bold text-schedule-text mt-8 mb-2">Stored files ({files.length})</h2>
      {files.length === 0 ? (
        <p className="text-schedule-textMuted text-sm">No files yet.</p>
      ) : (
        <ul className="space-y-3">
          {files.map((f) => (
            <li key={f.id} className="rounded-2xl border border-schedule-border bg-schedule-card p-4 shadow-sm">
              <p className="font-semibold text-schedule-text text-sm break-words">{f.name}</p>
              <p className="text-schedule-textMuted text-xs mt-1">
                {formatBytes(f.size)} · {new Date(f.createdAt).toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => void downloadFile(f.id)}
                  className="text-sm font-semibold text-schedule-accent hover:underline"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => void removeFile(f.id)}
                  className="text-sm font-semibold text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
