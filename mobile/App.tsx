import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeDashboardScreen } from './src/screens/HomeDashboardScreen';
import { FilesScreen } from './src/screens/FilesScreen';
import { PurchasesScreen } from './src/screens/PurchasesScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { COLORS } from './src/theme';

type TabId = 'home' | 'files' | 'purchases' | 'schedule';

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'files', label: 'Files' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'schedule', label: 'Schedule' },
];

function MainTabs() {
  const [tab, setTab] = useState<TabId>('home');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.shell}>
      <View style={styles.body}>
        {tab === 'home' ? <HomeDashboardScreen /> : null}
        {tab === 'files' ? <FilesScreen /> : null}
        {tab === 'purchases' ? <PurchasesScreen /> : null}
        {tab === 'schedule' ? <ScheduleScreen /> : null}
      </View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t) => {
          const active = tab === t.id;
  return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setTab(t.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
                {t.label}
              </Text>
            </TouchableOpacity>
              );
            })}
          </View>
    </View>
  );
}

function Root() {
  const { user, ready: authReady } = useAuth();

  if (!authReady) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <MainTabs />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

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
  shell: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: COLORS.accentLight + '55',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.tabInactive,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
});
