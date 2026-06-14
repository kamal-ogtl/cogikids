/**
 * Storage abstraction — key-value persistence backed by MMKV in dev/production
 * builds, falling back to an in-memory map in Expo Go where native modules are
 * unavailable. Import this everywhere instead of using createMMKV directly.
 */

export interface StorageBackend {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): boolean;
}

function createFallbackStorage(): StorageBackend {
  const map = new Map<string, string>();
  return {
    getString: (key) => map.get(key),
    set: (key, value) => { map.set(key, value); },
    remove: (key) => map.delete(key),
  };
}

// Detect Expo Go at runtime — in Expo Go, global.__ExpoDevClient is absent
// and native-only modules throw on access. We check for a known MMKV sentinel.
function createStorage(): StorageBackend {
  try {
    // Inline require keeps Metro from statically tracing react-native-mmkv's
    // full native dependency chain when bundling for Expo Go.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mmkv = require('react-native-mmkv') as typeof import('react-native-mmkv');
    const instance = mmkv.createMMKV({ id: 'cogniedufy-kids-cache' });
    // Probe to confirm it's actually usable (throws in Expo Go at runtime)
    instance.getString('__probe__');
    return instance;
  } catch {
    console.warn('[Storage] MMKV unavailable — using in-memory fallback (Expo Go mode)');
    return createFallbackStorage();
  }
}

const storage = createStorage();
export default storage;
