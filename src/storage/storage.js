import AsyncStorage from '@react-native-async-storage/async-storage';


const storage = {
  async getItem(key, fallback = null) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[storage] getItem failed for ${key}`, e);
      return fallback;
    }
  },

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[storage] setItem failed for ${key}`, e);
      return false;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[storage] removeItem failed for ${key}`, e);
      return false;
    }
  },

  async multiRemove(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (e) {
      console.warn('[storage] multiRemove failed', e);
      return false;
    }
  },
};

export default storage;
