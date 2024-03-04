import { MMKV } from 'react-native-mmkv';

const store = new MMKV({ id: 'plugin_db' });

interface StoredItem {
  created: Date;
  value: any;
  expires?: Date;
}

class Storage {
  mmkv: MMKV;

  constructor() {
    this.mmkv = store;
  }

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
    this.mmkv.set(`${pluginID}_DB_${key}`, JSON.stringify(item));
  }

  get(pluginID: string, key: string, raw?: boolean): any {
    const storedItem = this.mmkv.getString(`${pluginID}_DB_${key}`);
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

  delete(pluginID: string, key: string): void {
    this.mmkv.delete(`${pluginID}_DB_${key}`);
  }

  clearAll(pluginID: string): void {
    const keysToRemove = this.getAllKeys(pluginID);
    keysToRemove.forEach(key => this.delete(pluginID, key));
  }

  getAllKeys(pluginID: string): string[] {
    const keys = this.mmkv
      .getAllKeys()
      .filter(key => key.startsWith(`${pluginID}_DB_`))
      .map(key => key.replace(`${pluginID}_DB_`, ''));
    return keys;
  }
}

export const storage = new Storage();

class LocalStorage {
  private mmkv: MMKV;

  constructor() {
    this.mmkv = store;
  }

  get(pluginID: string): StoredItem.value | undefined {
    const data = this.mmkv.getString(`${pluginID}_LocalStorage`);
    return data ? JSON.parse(data) : undefined;
  }
}
export const localStorage = new LocalStorage();

class SessionStorage {
  private mmkv: MMKV;

  constructor() {
    this.mmkv = store;
  }

  get(pluginID: string): StoredItem.value | undefined {
    const data = this.mmkv.getString(`${pluginID}_SessionStorage`);
    return data ? JSON.parse(data) : undefined;
  }
}

export const sessionStorage = new SessionStorage();
