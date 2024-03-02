import { MMKV } from 'react-native-mmkv';

export const storageRaw = new MMKV({ id: 'plugin_db' });

interface StoredItem {
  created: Date;
  value: any;
  expires?: Date;
}

class Storage {
  mmkv: MMKV;

  constructor() {
    this.mmkv = storageRaw;
  }

  set(
    pluginID: string,
    key: string,
    value: any,
    expires?: Date | number,
  ): boolean {
    const item: StoredItem = {
      created: Date.now(),
      value,
      expires: expires instanceof Date ? expires.getTime() : expires,
    };
    this.mmkv.set(`${pluginID}_DB_${key}`, JSON.stringify(item));
    return true;
  }

  get(pluginID: string, key: string, raw?: boolean): any {
    const storedItem = this.mmkv.getString(`${pluginID}_DB_${key}`);
    if (storedItem) {
      const item: StoredItem = JSON.parse(storedItem);
      if (item.expires && Date.now() > item.expires) {
        this.delete(pluginID, key);
        return undefined;
      }
      return raw ? item : item.value;
    }
    return undefined;
  }

  delete(pluginID: string, key: string): boolean {
    this.mmkv.delete(`${pluginID}_DB_${key}`);
    return true;
  }

  clearAll(pluginID: string): boolean {
    const keysToRemove = this.getAllKeys(pluginID);
    keysToRemove.forEach(key => this.delete(pluginID, key));
    return true;
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
  mmkv: MMKV;

  constructor() {
    this.mmkv = storageRaw;
  }

  get(pluginID: string): StoredItem.value | undefined {
    const data = this.mmkv.getString(`${pluginID}_LocalStorage`);
    return data ? JSON.parse(data) : undefined;
  }
}
export const localStorage = new LocalStorage();

class SessionStorage {
  mmkv: MMKV;

  constructor() {
    this.mmkv = storageRaw;
  }

  get(pluginID: string): StoredItem.value | undefined {
    const data = this.mmkv.getString(`${pluginID}_SessionStorage`);
    return data ? JSON.parse(data) : undefined;
  }
}
export const sessionStorage = new SessionStorage();
