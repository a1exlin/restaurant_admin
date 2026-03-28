import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword } from './password';
import { getUsers, saveUsers, SESSION_KEY } from './userStorage';

export type AuthUser = { email: string };

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { email?: string };
          if (parsed.email && typeof parsed.email === 'string') {
            setUser({ email: parsed.email });
          }
        }
      } catch {
        /* ignore */
      }
      setReady(true);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const key = normalizeEmail(email);
    if (!key) return { ok: false as const, error: 'Enter your email.' };
    const users = await getUsers();
    const hash = await hashPassword(password);
    if (!users[key] || users[key] !== hash) {
      return { ok: false as const, error: 'Invalid email or password.' };
    }
    setUser({ email: key });
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ email: key }));
    return { ok: true as const };
  }, []);

  const signup = useCallback(async (email: string, password: string, confirmPassword: string) => {
    const key = normalizeEmail(email);
    if (!key) return { ok: false as const, error: 'Enter your email.' };
    if (!isValidEmail(key)) return { ok: false as const, error: 'Enter a valid email address.' };
    if (password.length < 6) {
      return { ok: false as const, error: 'Password must be at least 6 characters.' };
    }
    if (password !== confirmPassword) {
      return { ok: false as const, error: 'Passwords do not match.' };
    }
    const users = await getUsers();
    if (users[key]) {
      return { ok: false as const, error: 'An account with this email already exists.' };
    }
    users[key] = await hashPassword(password);
    await saveUsers(users);
    setUser({ email: key });
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ email: key }));
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, signup, logout }),
    [user, ready, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
