import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { BRAND_LOGO_ALT, BRAND_SITE_URL, ECHO_FIVES_LOGO_SRC } from '../brand';
import { wmoLabel } from '../utils/weatherLabels';

type WeatherCurrent = {
  temperature: number;
  wind: number;
  code: number;
};

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(String(lat))}&longitude=${encodeURIComponent(String(lon))}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  const j = (await res.json()) as {
    locality?: string;
    city?: string;
    principalSubdivision?: string;
    countryName?: string;
    postcode?: string;
  };
  const parts = [j.locality || j.city, j.principalSubdivision, j.postcode, j.countryName].filter(Boolean);
  return parts.length ? parts.join(', ') : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

export default function HomeDashboardPage() {
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('78575');

  const load = useCallback(async () => {
    setWeatherError(null);
    if (!navigator.geolocation) {
      setPermission('denied');
      setAddress('Geolocation is not supported in this browser.');
      setWeatherError('Weather needs location access. Try a modern browser on HTTPS or localhost.');
      return;
    }

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setPermission('granted');
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCoords({ lat, lon });
          try {
            const line = await reverseGeocode(lat, lon);
            setAddress(line);
          } catch {
            setAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
          }
          try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
            const wres = await fetch(url);
            if (!wres.ok) throw new Error('Weather request failed');
            const data = (await wres.json()) as {
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
          resolve();
        },
        (err) => {
          setPermission('denied');
          if (err.code === 1) {
            setAddress('Location permission denied. Allow location for this site to see address and weather.');
          } else if (err.code === 2) {
            setAddress('Could not determine your location right now. Check network/GPS and try again.');
          } else if (err.code === 3) {
            setAddress('Location request timed out. Try again.');
          } else {
            setAddress('Could not access location.');
          }
          setWeather(null);
          setWeatherError('Weather update failed because location could not be retrieved.');
          if (manualLocation.trim()) {
            void onManualLookup();
          }
          resolve();
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 15_000 }
      );
    });
  }, [manualLocation]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = async () => {
    setBusy(true);
    await load();
    setBusy(false);
  };

  const onManualLookup = async () => {
    const query = manualLocation.trim();
    if (!query) {
      setWeatherError('Enter a city or ZIP code first.');
      return;
    }
    setBusy(true);
    setWeatherError(null);
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error('Could not look up location.');
      const geo = (await geoRes.json()) as {
        results?: Array<{
          latitude: number;
          longitude: number;
          name: string;
          admin1?: string;
          country?: string;
        }>;
      };
      const first = geo.results?.[0];
      if (!first) throw new Error('No matching location found.');
      const lat = first.latitude;
      const lon = first.longitude;
      setCoords({ lat, lon });
      setPermission('denied');
      setAddress([first.name, first.admin1, first.country].filter(Boolean).join(', '));

      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
      const wRes = await fetch(wUrl);
      if (!wRes.ok) throw new Error('Weather request failed');
      const data = (await wRes.json()) as {
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
      setWeatherError(e instanceof Error ? e.message : 'Could not load weather.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <a href={BRAND_SITE_URL} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src={ECHO_FIVES_LOGO_SRC} alt={BRAND_LOGO_ALT} className="h-7 w-[100px] object-contain" />
        </a>
        <h1 className="text-xl font-bold text-schedule-text">Home</h1>
      </div>

      <div className="rounded-2xl border border-schedule-border bg-schedule-card p-4 mb-4 shadow-sm">
        <h2 className="text-sm font-bold text-schedule-text mb-2">Current location</h2>
        {coords ? (
          <p className="text-schedule-text text-sm leading-relaxed">{address ?? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`}</p>
        ) : (
          <p className="text-schedule-textMuted text-sm">{address ?? 'Getting location…'}</p>
        )}
        {permission === 'denied' && (
          <p className="text-schedule-textMuted text-xs mt-2">
            Enable location in browser settings. Geolocation only works on HTTPS (or localhost in development).
          </p>
        )}
        <div className="mt-3 border-t border-schedule-border pt-3">
          <p className="text-schedule-textMuted text-xs mb-2">No GPS access? Enter city or ZIP:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Corpus Christi or 78418"
              className="flex-1 rounded-lg border border-schedule-border bg-schedule-bg px-3 py-2 text-sm text-schedule-text"
            />
            <button
              type="button"
              onClick={() => void onManualLookup()}
              disabled={busy}
              className="rounded-lg border border-schedule-border bg-schedule-card px-3 py-2 text-sm font-semibold text-schedule-text hover:bg-schedule-accentLight/30 disabled:opacity-60"
            >
              Use
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-schedule-border bg-schedule-card p-4 mb-4 shadow-sm">
        <h2 className="text-sm font-bold text-schedule-text mb-2">Weather</h2>
        {weather ? (
          <>
            <p className="text-4xl font-bold text-schedule-accent">{Math.round(weather.temperature)}°F</p>
            <p className="text-schedule-text text-sm mt-1">{wmoLabel(weather.code)}</p>
            <p className="text-schedule-textMuted text-xs mt-1">Wind ~{Math.round(weather.wind)} mph · Open-Meteo</p>
          </>
        ) : (
          <p className="text-schedule-textMuted text-sm">{weatherError ?? 'Allow location, then refresh.'}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => void onRefresh()}
        disabled={busy}
        className="w-full rounded-xl bg-schedule-accent text-white font-semibold py-3 text-sm hover:bg-schedule-accentHover disabled:opacity-60 transition-colors"
      >
        {busy ? 'Refreshing…' : 'Refresh location & weather'}
      </button>

      <button
        type="button"
        onClick={logout}
        className="w-full mt-4 rounded-xl border border-schedule-border bg-schedule-card text-schedule-textMuted font-semibold py-3 text-sm hover:bg-schedule-accentLight/30 transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
