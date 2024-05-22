import { MMKV } from 'react-native-mmkv';

const store = new MMKV({ id: 'plugin_db' });

const PLUGIN_STORAGE = '_DB_';
const WEBVIEW_LOCAL_STORAGE = '_LocalStorage';
const WEBVIEW_SESSION_STORAGE = '_SessionStorage';

interface StoredItem {
  created: Date;
  value: any;
  expires?: number; // timestamp (miliseconds)
}

class Storage {
  #pluginID: string;

  constructor(pluginID: string) {
    this.#pluginID = pluginID;
  }

  /**
   * Sets a key-value pair in storage.
   *
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   * @param {Date | number} [expires] - Optional expiry date or time in milliseconds.
   */
  set(key: string, value: any, expires?: Date | number): void {
    const item: StoredItem = {
      created: new Date(),
      value,
      expires: expires instanceof Date ? expires.getTime() : expires,
    };
    store.set(this.#pluginID + PLUGIN_STORAGE + key, JSON.stringify(item));
  }

  /**
   * Retrieves the value for a given key from storage.
   *
   * @param {string} key - The key to retrieve the value for.
   * @param {boolean} [raw] - Optional flag to return the raw stored item.
   * @returns {any} The stored value or undefined if key is not found.
   */
  get(key: string, raw?: boolean): any {
    const storedItem = store.getString(this.#pluginID + PLUGIN_STORAGE + key);
    if (storedItem) {
      const item: StoredItem = JSON.parse(storedItem);
      if (item.expires) {
        if (Date.now() > item.expires) {
          this.delete(key);
          return undefined;
        }
        if (raw) {
          item.expires = new Date(item.expires).getTime();
        }
      }
      return raw ? item : item.value;
    }
    return undefined;
  }

  /**
   * Deletes a key from storage.
   *
   * @param {string} key - The key to delete.
   */
  delete(key: string): void {
    store.delete(this.#pluginID + PLUGIN_STORAGE + key);
  }

  /**
   * Clears all stored items from storage.
   */
  clearAll(): void {
    const keysToRemove = this.getAllKeys();
    keysToRemove.forEach(key => this.delete(key));
  }

  /**
   * Retrieves all keys set by the `set` method.
   *
   * @returns {string[]} An array of keys.
   */
  getAllKeys(): string[] {
    const keys = store
      .getAllKeys()
      .filter(key => key.startsWith(this.#pluginID + PLUGIN_STORAGE))
      .map(key => key.replace(this.#pluginID + PLUGIN_STORAGE, ''));
    return keys;
  }
}

class LocalStorage {
  #pluginID: string;

  constructor(pluginID: string) {
    this.#pluginID = pluginID;
  }

  get(): StoredItem['value'] | undefined {
    const data = store.getString(this.#pluginID + WEBVIEW_LOCAL_STORAGE);
    return data ? JSON.parse(data) : undefined;
  }
}

class SessionStorage {
  #pluginID: string;

  constructor(pluginID: string) {
    this.#pluginID = pluginID;
  }

  get(): StoredItem['value'] | undefined {
    const data = store.getString(this.#pluginID + WEBVIEW_SESSION_STORAGE);
    return data ? JSON.parse(data) : undefined;
  }
}

export { Storage, LocalStorage, SessionStorage };

//to record data from the web view
export { WEBVIEW_LOCAL_STORAGE, WEBVIEW_SESSION_STORAGE, store };
