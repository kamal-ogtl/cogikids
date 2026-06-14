/**
 * MMKV mock — pure-JS stand-in for react-native-mmkv, swapped in by Metro when
 * bundling for Expo Go (no native modules). Implements the same interface but
 * stores everything in an in-memory map.
 */

function createMMKV() {
  const store = new Map();
  return {
    set: (key, value) => store.set(key, String(value)),
    getString: (key) => store.get(key),
    getNumber: (key) => { const v = store.get(key); return v !== undefined ? Number(v) : undefined; },
    getBoolean: (key) => { const v = store.get(key); return v !== undefined ? v === 'true' : undefined; },
    contains: (key) => store.has(key),
    remove: (key) => store.delete(key),
    getAllKeys: () => Array.from(store.keys()),
    clearAll: () => store.clear(),
    addOnValueChangedListener: () => ({ remove: () => {} }),
  };
}

module.exports = {
  createMMKV,
  useMMKV: () => createMMKV(),
  useMMKVString: () => [undefined, () => {}],
  useMMKVNumber: () => [undefined, () => {}],
  useMMKVBoolean: () => [undefined, () => {}],
  useMMKVObject: () => [undefined, () => {}],
  useMMKVListener: () => {},
  useMMKVKeys: () => [[]],
};
