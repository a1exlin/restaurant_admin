import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { COLORS, layoutStyles } from '../theme';
import { useAuth } from '../auth/AuthContext';
import { BRAND_SITE_URL, echoFivesLogo } from '../brand';

type WeatherCurrent = {
  temperature: number;
  wind: number;
  code: number;
};

function wmoLabel(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Snow',
    80: 'Rain showers',
    95: 'Thunderstorm',
  };
  return map[code] ?? 'Weather';
}

export function HomeDashboardScreen() {
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setWeatherError(null);
    if (Platform.OS === 'web') {
      setPermission('denied');
      setAddress('Location is limited on web; open the native app for GPS.');
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermission('denied');
      setAddress('Location permission denied.');
      return;
    }
    setPermission('granted');
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    setCoords({ lat, lon });

    try {
      const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      const p = places[0];
      if (p) {
        const parts = [p.name, p.street, p.city, p.region, p.postalCode].filter(Boolean);
        setAddress(parts.length ? parts.join(', ') : `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      } else {
        setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather request failed');
      const data = (await res.json()) as {
        current?: { temperature_2m: number; weather_code: number; wind_speed_10m: number };
      };
      const c = data.current;
      if (!c) throw new Error('No current weather');
      setWeather({
        temperature: c.temperature_2m,
        wind: c.wind_speed_10m,
        code: c.weather_code,
      });
    } catch (e) {
      setWeather(null);
      setWeatherError(e instanceof Error ? e.message : 'Could not load weather');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <ScrollView
      style={layoutStyles.screenScroll}
      contentContainerStyle={layoutStyles.screenContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => Linking.openURL(BRAND_SITE_URL)} activeOpacity={0.7}>
          <Image source={echoFivesLogo} style={styles.headerLogo} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Home</Text>
      </View>

      <View style={layoutStyles.card}>
        <Text style={layoutStyles.cardTitle}>Current location</Text>
        {coords ? (
          <Text style={styles.bodyText}>
            {address ?? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`}
          </Text>
        ) : (
          <Text style={layoutStyles.muted}>{address ?? 'Getting location…'}</Text>
        )}
        {permission === 'denied' && Platform.OS !== 'web' ? (
          <Text style={[layoutStyles.muted, { marginTop: 8 }]}>Enable location in Settings to see address and weather.</Text>
        ) : null}
      </View>

      <View style={layoutStyles.card}>
        <Text style={layoutStyles.cardTitle}>Weather</Text>
        {weather ? (
          <>
            <Text style={styles.bigTemp}>{Math.round(weather.temperature)}°F</Text>
            <Text style={styles.bodyText}>{wmoLabel(weather.code)}</Text>
            <Text style={layoutStyles.muted}>Wind ~{Math.round(weather.wind)} mph · Open-Meteo</Text>
          </>
        ) : (
          <Text style={layoutStyles.muted}>{weatherError ?? 'Pull to refresh after enabling location.'}</Text>
        )}
      </View>

      <TouchableOpacity style={layoutStyles.primaryBtn} onPress={() => void load()}>
        <Text style={layoutStyles.primaryBtnText}>Refresh location & weather</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutOutline} onPress={logout}>
        <Text style={styles.logoutOutlineText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerLogo: { height: 28, width: 100 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  bodyText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  bigTemp: { fontSize: 40, fontWeight: '700', color: COLORS.accent, marginBottom: 4 },
  logoutOutline: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  logoutOutlineText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
});
