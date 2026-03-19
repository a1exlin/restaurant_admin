import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Image,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { RoleWithStaff } from './src/types';
import { useScheduleStore } from './src/store/useScheduleStore';
import { getWeekDates, getStartOfWeek } from './src/utils/dateUtils';
import { formatShiftDisplay, parseShiftInput } from './src/utils/dateUtils';

const CELL_WIDTH = 72;
const NAME_WIDTH = 100;

function WeekNav({ weekStart, onWeekChange }: { weekStart: string; onWeekChange: (d: Date) => void }) {
  const start = new Date(weekStart + 'T12:00:00');
  const weekDates = getWeekDates(start);
  const label = `${weekDates[0].date.toLocaleDateString('en-US', { month: 'short' })} ${weekDates[0].date.getDate()} – ${weekDates[6].date.toLocaleDateString('en-US', { month: 'short' })} ${weekDates[6].date.getDate()}`;

  const go = (delta: number) => {
    const d = new Date(start);
    d.setDate(d.getDate() + delta * 7);
    onWeekChange(d);
  };

  return (
    <View style={styles.weekNav}>
      <View style={styles.headerRow}>
        <Image source={require('./assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}>Schedule</Text>
      </View>
      <View style={styles.weekNavRow}>
        <TouchableOpacity style={styles.navBtn} onPress={() => go(-1)}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>{label}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => go(1)}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, styles.todayBtn]}
          onPress={() => onWeekChange(getStartOfWeek(new Date()))}
        >
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddStaffModal({
  roleLabel,
  onAdd,
  onClose,
}: {
  roleLabel: string;
  onAdd: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Add to {roleLabel}</Text>
          <TextInput
            style={styles.modalInput}
            value={name}
            onChangeText={setName}
            placeholder="Staff name"
            placeholderTextColor="#64748b"
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.modalBtn}>
              <Text style={styles.modalBtnCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onAdd(name.trim() || 'New');
                onClose();
              }}
              style={[styles.modalBtn, styles.modalBtnPrimary]}
            >
              <Text style={styles.modalBtnPrimaryText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function RoleSection({
  role,
  weekDates,
  getShift,
  setShift,
  getHeadcount,
  setHeadcount,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}: {
  role: RoleWithStaff;
  weekDates: { day: import('./src/types').DayOfWeek; label: string }[];
  getShift: (a: string, b: string, c: import('./src/types').DayOfWeek) => { timeRange: string; suffix?: string } | null;
  setShift: (a: string, b: string, c: import('./src/types').DayOfWeek, d: { timeRange: string; suffix?: string } | null) => void;
  getHeadcount: (a: string, b: import('./src/types').DayOfWeek) => { morning: number; night: number };
  setHeadcount: (a: string, b: import('./src/types').DayOfWeek, m: number, n: number) => void;
  onAddStaff: (name: string) => void;
  onUpdateStaff: (id: string, name: string) => void;
  onDeleteStaff: (id: string) => void;
}) {
  const [addModal, setAddModal] = useState(false);
  const [editingCell, setEditingCell] = useState<{ staffId: string; day: import('./src/types').DayOfWeek } | null>(null);
  const [editingHeadcount, setEditingHeadcount] = useState<import('./src/types').DayOfWeek | null>(null);
  const [editInput, setEditInput] = useState('');
  const [editHeadcountInput, setEditHeadcountInput] = useState('');
  const [editName, setEditName] = useState<{ id: string; name: string } | null>(null);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{role.label}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row */}
          <View style={styles.tableRow}>
            <View style={[styles.cell, styles.nameCell, styles.headerCell]}>
              <Text style={styles.headerText}>Name</Text>
            </View>
            {weekDates.map(({ day, label }) => (
              <View key={day} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText} numberOfLines={2}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Staff rows */}
          {role.staff.map((s) => (
            <View key={s.id} style={styles.tableRow}>
              <View style={[styles.cell, styles.nameCell]}>
                {editName?.id === s.id ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editName.name}
                    onChangeText={(t) => setEditName({ ...editName, name: t })}
                    onBlur={() => {
                      onUpdateStaff(s.id, editName.name.trim() || s.name);
                      setEditName(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <View style={styles.nameCellContent}>
                    <TouchableOpacity
                      style={styles.nameTouch}
                      onPress={() => setEditName({ id: s.id, name: s.name })}
                    >
                      <Text style={styles.nameText} numberOfLines={1}>
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => onDeleteStaff(s.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteBtnText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {weekDates.map(({ day }) => {
                const key = `${s.id}-${day}`;
                const isEditing = editingCell?.staffId === s.id && editingCell?.day === day;
                const shift = getShift(role.id, s.id, day);
                const display = formatShiftDisplay(shift) || '—';

                return (
                  <View key={key} style={styles.cell}>
                    {isEditing ? (
                      <TextInput
                        style={styles.shiftInput}
                        value={editInput}
                        onChangeText={setEditInput}
                        onBlur={() => {
                          const parsed = parseShiftInput(editInput);
                          setShift(role.id, s.id, day, parsed);
                          setEditingCell(null);
                        }}
                        placeholder="5-11, RO..."
                        placeholderTextColor="#64748b"
                        autoFocus
                      />
                    ) : (
                      <TouchableOpacity
                        style={styles.shiftCell}
                        onPress={() => {
                          setEditInput(display === '—' ? '' : display);
                          setEditingCell({ staffId: s.id, day });
                        }}
                      >
                        <Text style={styles.shiftText}>{display}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {/* Headcount row */}
          <View style={[styles.tableRow, styles.headcountRow]}>
            <View style={[styles.cell, styles.nameCell, styles.headcountLabel]}>
              <Text style={styles.headcountLabelText}>AM–PM</Text>
            </View>
              {weekDates.map(({ day }) => {
              const hc = getHeadcount(role.id, day);
              const isEditing = editingHeadcount === day;

              return (
                <View key={day} style={styles.cell}>
                  {isEditing ? (
                    <View style={styles.hcEditRow}>
                      <TextInput
                        style={styles.hcInput}
                        value={editHeadcountInput}
                        onChangeText={setEditHeadcountInput}
                        keyboardType="number-pad"
                        onBlur={() => {
                          const [m, n] = editHeadcountInput.split('-').map((x) => Math.max(0, parseInt(x, 10) || 0));
                          setHeadcount(role.id, day, m, n);
                          setEditingHeadcount(null);
                        }}
                        autoFocus
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.headcountCell}
                      onPress={() => {
                        setEditHeadcountInput(`${hc.morning}-${hc.night}`);
                        setEditingHeadcount(day);
                      }}
                    >
                      <Text style={styles.headcountText}>
                        {hc.morning}-{hc.night}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {role.staff.length === 0 && (
        <Text style={styles.emptyText}>No staff. Tap + Add to add someone.</Text>
      )}

      {addModal && (
        <AddStaffModal
          roleLabel={role.label}
          onAdd={(name) => {
            onAddStaff(name);
            setAddModal(false);
          }}
          onClose={() => setAddModal(false)}
        />
      )}
    </View>
  );
}

export default function App() {
  const {
    state,
    isHydrated,
    addStaff,
    updateStaff,
    deleteStaff,
    setShift,
    setHeadcount,
    setWeekStart,
    getShift,
    getHeadcount,
    copyWeekToNext,
    loadSampleSchedule,
  } = useScheduleStore();

  const weekStart = new Date(state.currentWeekStart + 'T12:00:00');
  const weekDates = getWeekDates(weekStart);

  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.loadingText}>Loading...</Text>
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <WeekNav weekStart={state.currentWeekStart} onWeekChange={setWeekStart} />

          <Text style={styles.hint}>
            Target headcount (AM–PM). Tap any cell to edit. Each week saves separately.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={copyWeekToNext}>
              <Text style={styles.actionBtnText}>Copy to next week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={loadSampleSchedule}>
              <Text style={styles.actionBtnText}>Load sample</Text>
            </TouchableOpacity>
          </View>

          {(state.roles as RoleWithStaff[]).map((role) => (
            <RoleSection
              key={role.id}
              role={role}
              weekDates={weekDates}
              getShift={getShift}
              setShift={setShift}
              getHeadcount={getHeadcount}
              setHeadcount={setHeadcount}
              onAddStaff={(name) => addStaff(role.id, name)}
              onUpdateStaff={(id, name) => updateStaff(role.id, id, name)}
              onDeleteStaff={(id) => deleteStaff(role.id, id)}
            />
          ))}

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Powered by </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://echofives.com')} activeOpacity={0.7}>
                <Image source={require('./assets/logo.png')} style={styles.footerLogo} resizeMode="contain" />
              </TouchableOpacity>
              <Text style={styles.footerText}> © 2026</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const COLORS = {
  bg: '#f5f5f0',
  card: '#ffffff',
  border: '#e5e4df',
  accent: '#2d6a4f',
  accentHover: '#1b4332',
  accentLight: '#95d5b2',
  text: '#1a1a1a',
  textMuted: '#5c5c5c',
  headcount: '#40916c',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLogo: {
    height: 20,
    width: 80,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerLogo: {
    height: 28,
    width: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 0,
  },
  weekNav: {
    marginBottom: 16,
  },
  weekNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
  },
  weekLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  todayBtn: {
    width: 'auto',
    paddingHorizontal: 14,
    backgroundColor: COLORS.accent,
  },
  todayBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  actionBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cell: {
    width: CELL_WIDTH,
    minHeight: 44,
    padding: 6,
    justifyContent: 'center',
  },
  nameCell: {
    width: NAME_WIDTH,
    minWidth: NAME_WIDTH,
  },
  headerCell: {
    backgroundColor: COLORS.accentLight + '33',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  nameCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameTouch: {
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: COLORS.textMuted,
    fontSize: 20,
    lineHeight: 20,
  },
  inlineInput: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: 14,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent + '80',
  },
  shiftCell: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  shiftText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  shiftInput: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: 12,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent + '80',
  },
  headcountRow: {
    backgroundColor: COLORS.accentLight + '40',
    borderTopWidth: 2,
    borderTopColor: COLORS.accent + '50',
  },
  headcountLabel: {
    justifyContent: 'center',
  },
  headcountLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.headcount,
  },
  headcountCell: {
    padding: 6,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  headcountText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.headcount,
    textAlign: 'center',
  },
  hcEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hcInput: {
    flex: 1,
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: 12,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent + '80',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalBtnCancel: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
  },
  modalBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
