import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  documentDirectory,
  copyAsync,
  getInfoAsync,
  deleteAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

const MANIFEST_KEY = '@restaurant-uploaded-files';

export type StoredFile = {
  id: string;
  name: string;
  localUri: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string;
};

function uploadsDir(): string {
  const base = documentDirectory ?? '';
  return `${base}uploads/`;
}

async function ensureUploadsDir(): Promise<void> {
  const dir = uploadsDir();
  const info = await getInfoAsync(dir);
  if (!info.exists) {
    await makeDirectoryAsync(dir, { intermediates: true });
  }
}

function safeFileSegment(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 80) || 'file';
}

export function useUploadedFilesStore() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MANIFEST_KEY);
        if (raw) setFiles(JSON.parse(raw) as StoredFile[]);
      } catch (_) {}
      setHydrated(true);
    })();
  }, []);

  const pickAndStore = useCallback(async (): Promise<{ ok: true } | { ok: false; message: string }> => {
    if (Platform.OS === 'web') {
      return { ok: false, message: 'File upload works in the iOS/Android app.' };
    }
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.length) {
      return { ok: false, message: 'No file selected.' };
    }
    const asset = result.assets[0];
    const fromUri = asset.uri;
    await ensureUploadsDir();
    const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const baseName = safeFileSegment(asset.name ?? 'document');
    const dest = `${uploadsDir()}${id}_${baseName}`;
    try {
      await copyAsync({ from: fromUri, to: dest });
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'Could not save file.' };
    }
    const entry: StoredFile = {
      id,
      name: asset.name ?? baseName,
      localUri: dest,
      size: asset.size ?? null,
      mimeType: asset.mimeType ?? null,
      createdAt: new Date().toISOString(),
    };
    setFiles((prev) => {
      const next = [entry, ...prev];
      void AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(next));
      return next;
    });
    return { ok: true };
  }, []);

  const removeFile = useCallback(async (id: string) => {
    setFiles((prev) => {
      const victim = prev.find((f) => f.id === id);
      const next = prev.filter((f) => f.id !== id);
      void AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(next));
      if (victim && Platform.OS !== 'web') {
        void getInfoAsync(victim.localUri)
          .then((info) => {
            if (info.exists) return deleteAsync(victim.localUri, { idempotent: true });
          })
          .catch(() => {});
      }
      return next;
    });
  }, []);

  return { files, hydrated, pickAndStore, removeFile };
}
