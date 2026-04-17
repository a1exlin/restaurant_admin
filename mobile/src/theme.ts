import { StyleSheet } from 'react-native';

export const COLORS = {
  bg: '#f5f5f0',
  card: '#ffffff',
  border: '#e5e4df',
  accent: '#2d6a4f',
  accentHover: '#1b4332',
  accentLight: '#95d5b2',
  text: '#1a1a1a',
  textMuted: '#5c5c5c',
  headcount: '#40916c',
  tabInactive: '#94a3b8',
  danger: '#b91c1c',
};

export const layoutStyles = StyleSheet.create({
  screenScroll: { flex: 1 },
  screenContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  muted: { color: COLORS.textMuted, fontSize: 13 },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
  },
});
