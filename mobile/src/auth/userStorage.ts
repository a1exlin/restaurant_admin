import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@restaurant_auth_users';
export const SESSION_KEY = '@restaurant_auth_session';

export async function getUsers(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function saveUsers(users: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}
