/**
 * All saving and loading goes through this module, so the app could later be
 * switched to a real database by changing only this file.
 *
 * Data is stored in the browser's localStorage under versioned keys.
 * Every access is wrapped in try/catch: storage can be unavailable
 * (private browsing, blocked site data), and the app should still work.
 */
const PREFIX = 'nemos-world';

export const STORAGE_KEYS = {
  appointments: `${PREFIX}:appointments:v1`,
  diary: `${PREFIX}:diary:v1`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Load a list. `isItem` drops anything malformed instead of crashing the app. */
export function loadList<T>(key: StorageKey, isItem: (value: unknown) => value is T): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isItem) : [];
  } catch {
    return [];
  }
}

/** Save a list. Returns false if the browser refused (e.g. storage full or disabled). */
export function saveList<T>(key: StorageKey, items: T[]): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

/** Call `onChange` when another browser tab changes this key. Returns an unsubscribe function. */
export function subscribe(key: StorageKey, onChange: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === key) onChange();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/** A unique id for a new record. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
