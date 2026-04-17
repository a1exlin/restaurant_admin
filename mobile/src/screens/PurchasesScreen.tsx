import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useEmployeePurchasesStore } from '../store/useEmployeePurchasesStore';
import { COLORS, layoutStyles } from '../theme';
import { BRAND_SITE_URL, echoFivesLogo } from '../brand';

export function PurchasesScreen() {
  const { items, hydrated, addPurchase, deletePurchase } = useEmployeePurchasesStore();
  const [employee, setEmployee] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4;

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

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
        <Text style={styles.screenTitle}>Employee purchases</Text>
      </View>

      <Text style={[layoutStyles.muted, { marginBottom: 12 }]}>
        Log when an employee buys something (deduction / staff purchase).
      </Text>

      <View style={layoutStyles.card}>
        <Text style={layoutStyles.cardTitle}>New transaction</Text>
        <TextInput
          style={layoutStyles.input}
          placeholder="Employee name"
          placeholderTextColor="#64748b"
          value={employee}
          onChangeText={setEmployee}
        />
        <TextInput
          style={[layoutStyles.input, { minHeight: 72 }]}
          placeholder="What they bought"
          placeholderTextColor="#64748b"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={layoutStyles.input}
          placeholder="Amount (e.g. 12.50)"
          placeholderTextColor="#64748b"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity
          style={layoutStyles.primaryBtn}
          onPress={() => {
            addPurchase(employee, description, amount);
            setEmployee('');
            setDescription('');
            setAmount('');
            setPage(1);
          }}
        >
          <Text style={layoutStyles.primaryBtnText}>Save transaction</Text>
        </TouchableOpacity>
      </View>

      <Text style={[layoutStyles.cardTitle, { marginTop: 8 }]}>Recent ({items.length})</Text>
      {items.length === 0 ? (
        <Text style={layoutStyles.muted}>No entries yet.</Text>
      ) : (
        pageItems.map((row) => (
          <View key={row.id} style={layoutStyles.card}>
            <Text style={styles.rowTitle}>{row.employeeName}</Text>
            <Text style={styles.rowBody}>{row.itemDescription}</Text>
            <Text style={styles.rowAmount}>{row.amount}</Text>
            <Text style={layoutStyles.muted}>{new Date(row.createdAt).toLocaleString()}</Text>
            <TouchableOpacity
              style={styles.remove}
              onPress={() => {
                deletePurchase(row.id);
                if (pageItems.length === 1 && safePage > 1) {
                  setPage(safePage - 1);
                }
              }}
            >
              <Text style={styles.removeText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      {items.length > 0 ? (
        <View style={styles.paginationRow}>
          <TouchableOpacity
            style={[styles.pageBtn, safePage === 1 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            <Text style={styles.pageBtnText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            Page {safePage} of {totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.pageBtn, safePage === totalPages && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  screenTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  rowBody: { fontSize: 14, color: COLORS.text, marginTop: 4 },
  rowAmount: { fontSize: 15, fontWeight: '600', color: COLORS.accent, marginTop: 6 },
  remove: { marginTop: 10, alignSelf: 'flex-start' },
  removeText: { color: COLORS.textMuted, fontSize: 14 },
  paginationRow: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  pageBtnDisabled: {
    opacity: 0.45,
  },
  pageBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  pageInfo: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
