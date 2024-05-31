import { MMKVStorage } from '@utils/mmkv/mmkv';
import { useMMKVString } from 'react-native-mmkv';

export const APP_STORAGE = 'APP_STORAGE';

interface AppStorage {
  rootStorage?: string;
  novelStorage?: string;
  pluginStorage?: string;
}
const _getAppStorages = (rootStorage?: string) => {
  const storage: AppStorage = {
    rootStorage,
  };
  if (rootStorage) {
    storage.novelStorage = rootStorage + '/Novels';
    storage.pluginStorage = rootStorage + '/Plugins';
  }
  return storage;
};

export default function useStorages() {
  const [rootStorage] = useMMKVString(APP_STORAGE);
  return _getAppStorages(rootStorage);
}

// call in non React component (download, backup, ...)
export const getAppStoragesSync = () => {
  const rootStorage = MMKVStorage.getString(APP_STORAGE);
  return _getAppStorages(rootStorage);
};

export const createStorages = () => {};
