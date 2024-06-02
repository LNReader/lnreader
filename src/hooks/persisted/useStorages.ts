import { MMKVStorage } from '@utils/mmkv/mmkv';
import { useMMKVString } from 'react-native-mmkv';
import * as RNFS from 'react-native-fs';

export const APP_STORAGE = 'APP_STORAGE';

const NOVEL_STORAGE_PATH = 'Novels';
const PLUGIN_STORAGE_PATH = 'Plugins';

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
    storage.novelStorage = rootStorage + '/' + NOVEL_STORAGE_PATH;
    storage.pluginStorage = rootStorage + '/' + PLUGIN_STORAGE_PATH;
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

export const setAppStorage = async (rootStorage: string) => {
  if (!(await RNFS.exists(rootStorage))) {
    throw new Error('Folder does not exist!');
  }
  const novelStorage = rootStorage + '/' + NOVEL_STORAGE_PATH;
  const pluginStorage = rootStorage + '/' + PLUGIN_STORAGE_PATH;
  await RNFS.mkdir(novelStorage);
  await RNFS.mkdir(pluginStorage);
  MMKVStorage.set(APP_STORAGE, rootStorage);
};
