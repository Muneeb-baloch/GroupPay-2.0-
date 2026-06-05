import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'gp_cache_';
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const cache = {
  async get(key) {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const { data, expiresAt } = JSON.parse(raw);
      if (expiresAt && Date.now() > expiresAt) return null;
      return data;
    } catch {
      return null;
    }
  },

  async set(key, data, ttlMs = DEFAULT_TTL_MS) {
    try {
      const payload = { data, expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null };
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(payload));
    } catch {
      // cache write failure is non-fatal
    }
  },

  async clear(key) {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch {}
  },
};
