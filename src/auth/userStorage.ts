const USERS_KEY = 'restaurant_auth_users';

export function getUsers(): Record<string, string> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveUsers(users: Record<string, string>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const SESSION_KEY = 'restaurant_auth_session';
