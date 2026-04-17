import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { useUploadedFilesStore } from '../store/useUploadedFilesStore';
import { COLORS, layoutStyles } from '../theme';
import { BRAND_SITE_URL, echoFivesLogo } from '../brand';

function formatBytes(n: number | null): string {
  if (n == null || Number.isNaN(n)) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function FilesScreen() {
  const { files, hydrated, pickAndStore, removeFile } = useUploadedFilesStore();
  const [busy, setBusy] = useState(false);

  const onUpload = async () => {
    setBusy(true);
    const r = await pickAndStore();
    setBusy(false);
    if (!r.ok && r.message !== 'No file selected.') {
      Alert.alert('Upload', r.message);
    }
  };

  if (!hydrated) {
    return (
      <View style={[styles.centered, { flex: 1 }]}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={layoutStyles.screenScroll} contentContainerStyle={layoutStyles.screenContent}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => Linking.openURL(BRAND_SITE_URL)} activeOpacity={0.7}>
          <Image source={echoFivesLogo} style={styles.headerLogo} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Files</Text>
      </View>

      <Text style={[layoutStyles.muted, { marginBottom: 14 }]}>
        Pick a document to copy it into this device’s app storage. List is saved locally.
      </Text>

      <TouchableOpacity
        style={[layoutStyles.primaryBtn, busy && { opacity: 0.6 }]}
        onPress={() => void onUpload()}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={layoutStyles.primaryBtnText}>Upload file</Text>
        )}
      </TouchableOpacity>

      <Text style={[layoutStyles.cardTitle, { marginTop: 22 }]}>Stored files ({files.length})</Text>
      {files.length === 0 ? (
        <Text style={layoutStyles.muted}>No files yet.</Text>
      ) : (
        files.map((f) => (
          <View key={f.id} style={layoutStyles.card}>
            <Text style={styles.fileName} numberOfLines={2}>
              {f.name}
            </Text>
            <Text style={layoutStyles.muted}>
              {formatBytes(f.size)} · {new Date(f.createdAt).toLocaleString()}
            </Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={() => void removeFile(f.id)}>
              <Text style={styles.dangerBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerLogo: { height: 28, width: 100 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  fileName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  dangerBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  dangerBtnText: { color: COLORS.danger, fontWeight: '600', fontSize: 14 },
});
