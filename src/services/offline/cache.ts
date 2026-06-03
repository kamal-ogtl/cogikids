/**
 * Cache — typed convenience layer over the key-value storage abstraction. Stores
 * the auth token and serialised app data so the client works offline; the root
 * index reads the token here to decide between onboarding and the main app.
 */
import storage from './storage';

const KEYS = {
  PLAYER: 'player',
  PROGRESS: 'progress',
  CACHED_LESSONS: 'cached_lessons',
  SYNC_QUEUE: 'sync_queue',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

function get<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function set(key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value));
}

function remove(key: string): void {
  storage.remove(key);
}

export const cache = {
  // Auth tokens
  getToken: () => storage.getString(KEYS.AUTH_TOKEN) ?? null,
  setToken: (token: string) => storage.set(KEYS.AUTH_TOKEN, token),
  clearToken: () => storage.remove(KEYS.AUTH_TOKEN),
  getRefreshToken: () => storage.getString(KEYS.REFRESH_TOKEN) ?? null,
  setRefreshToken: (token: string) => storage.set(KEYS.REFRESH_TOKEN, token),

  // Generic typed helpers
  get,
  set,
  remove,

  // Lesson cache — store next 3 nodes ahead
  getCachedLesson: (nodeId: string) => get<unknown>(`lesson_${nodeId}`),
  setCachedLesson: (nodeId: string, lesson: unknown) => set(`lesson_${nodeId}`, lesson),

  // Offline sync queue — progress events that haven't been flushed to Flask
  getSyncQueue: <T>() => get<T[]>(KEYS.SYNC_QUEUE) ?? [],
  enqueueSyncItem: <T>(item: T) => {
    const queue = get<T[]>(KEYS.SYNC_QUEUE) ?? [];
    set(KEYS.SYNC_QUEUE, [...queue, item]);
  },
  clearSyncQueue: () => remove(KEYS.SYNC_QUEUE),
};

export default cache;
