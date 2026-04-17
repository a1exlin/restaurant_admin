import { useState, useCallback, useEffect } from 'react';
import { idbDelete, idbGet, idbGetAll, idbPut, type StoredBlobRow } from '../lib/fileWebDb';

export type StoredFileMeta = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

export function useUploadedFilesWebStore() {
  const [files, setFiles] = useState<StoredFileMeta[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const isStorageSupported =
    typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

  const refresh = useCallback(async () => {
    if (!isStorageSupported) {
      setFiles([]);
      setStorageError('This browser does not support IndexedDB file storage.');
      return;
    }
    try {
      const rows = await idbGetAll();
      const meta: StoredFileMeta[] = rows
        .map((r) => ({
          id: r.id,
          name: r.name,
          mimeType: r.mimeType,
          size: r.size,
          createdAt: r.createdAt,
        }))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setFiles(meta);
      setStorageError(null);
    } catch {
      setFiles([]);
      setStorageError('Could not read local file storage. Try a normal (non-private) browser window.');
    }
  }, [isStorageSupported]);

  useEffect(() => {
    void refresh().finally(() => setHydrated(true));
  }, [refresh]);

  const toArrayBuffer = useCallback((file: File): Promise<ArrayBuffer> => {
    if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read selected file.'));
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const addFile = useCallback(
    async (file: File | null): Promise<{ ok: true } | { ok: false; message: string }> => {
      if (!isStorageSupported) {
        return { ok: false, message: 'This browser does not support local file storage.' };
      }
      if (!file) return { ok: false, message: 'No file selected.' };
      const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      try {
        const data = await toArrayBuffer(file);
        const row: StoredBlobRow = {
          id,
          name: file.name || 'document',
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          createdAt: new Date().toISOString(),
          data,
        };
        await idbPut(row);
        await refresh();
        setStorageError(null);
        return { ok: true };
      } catch (e) {
        return { ok: false, message: e instanceof Error ? e.message : 'Could not save file.' };
      }
    },
    [isStorageSupported, refresh, toArrayBuffer]
  );

  const removeFile = useCallback(
    async (id: string) => {
      try {
        await idbDelete(id);
        await refresh();
      } catch (_) {}
    },
    [refresh]
  );

  const downloadFile = useCallback(async (id: string) => {
    if (!isStorageSupported) return;
    const row = await idbGet(id);
    if (!row) return;
    const blob = new Blob([row.data], { type: row.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = row.name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [isStorageSupported]);

  return { files, hydrated, addFile, removeFile, downloadFile, refresh, storageError };
}
