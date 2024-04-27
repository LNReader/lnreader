import { MMKV } from 'react-native-mmkv';

const store = new MMKV({ id: 'plugin_db' });

const PLUGIN_STORAGE = '_DB_';
const WEBVIEW_LOCAL_STORAGE = '_LocalStorage';
const WEBVIEW_SESSION_STORAGE = '_SessionStorage';

interface StoredItem {
  created: Date;
  value: any;
  expires?: Date;
}

class Storage {
  /**
   * Sets a key-value pair in the storage.
   *
   * @param pluginID - The ID of the plugin.
   * @param key - The key to set.
   * @param value - The value to set.
   * @param expires - Optional. The expiration date for the key-value pair.
   */
  set(
    pluginID: string,
    key: string,
    value: any,
    expires?: Date | number,
  ): void {
    const item: StoredItem = {
      created: new Date(),
      value,
      expires: expires instanceof Date ? expires.getTime() : expires,
    };
    store.set(pluginID + PLUGIN_STORAGE + key, JSON.stringify(item));
  }

  /**
   * Gets the value associated with a key from the storage.
   *
   * @param pluginID - The ID of the plugin.
   * @param key - The key to retrieve.
   * @param raw - Optional. If true, returns the raw storage item object.
   * @returns The value associated with the key or undefined if not found or expired.
   */
  get(pluginID: string, key: string, raw?: boolean): any {
    const storedItem = store.getString(pluginID + PLUGIN_STORAGE + key);
    if (storedItem) {
      const item: StoredItem = JSON.parse(storedItem);
      if (item.expires) {
        if (Date.now() > item.expires) {
          this.delete(pluginID, key);
          return undefined;
        }
        if (raw) {
          item.expires = new Date(item.expires);
        }
      }
      return raw ? item : item.value;
    }
    return undefined;
  }

  /**
   * Deletes a key from the storage.
   *
   * @param pluginID - The ID of the plugin.
   * @param key - The key to delete.
   */
  delete(pluginID: string, key: string): void {
    store.delete(pluginID + PLUGIN_STORAGE + key);
  }

  /**
   * Clears all keys associated with a plugin from the storage.
   *
   * @param pluginID - The ID of the plugin.
   */
  clearAll(pluginID: string): void {
    const keysToRemove = this.getAllKeys(pluginID);
    keysToRemove.forEach(key => this.delete(pluginID, key));
  }

  /**
   * Gets all keys associated with a plugin from the storage.
   *
   * @param pluginID - The ID of the plugin.
   * @returns An array of keys associated with the plugin.
   */
  getAllKeys(pluginID: string): string[] {
    const keys = store
      .getAllKeys()
      .filter(key => key.startsWith(pluginID + PLUGIN_STORAGE))
      .map(key => key.replace(pluginID + PLUGIN_STORAGE, ''));
    return keys;
  }
}

class LocalStorage {
  get(pluginID: string): StoredItem.value | undefined {
    const data = store.getString(pluginID + WEBVIEW_LOCAL_STORAGE);
    return data ? JSON.parse(data) : undefined;
  }
}

class SessionStorage {
  get(pluginID: string): StoredItem.value | undefined {
    const data = store.getString(pluginID + WEBVIEW_SESSION_STORAGE);
    return data ? JSON.parse(data) : undefined;
  }
}

const storage = new Storage();
const localStorage = new LocalStorage();
const sessionStorage = new SessionStorage();

export { storage, localStorage, sessionStorage };

//to record data from the web view
export { WEBVIEW_LOCAL_STORAGE, WEBVIEW_SESSION_STORAGE, store };
