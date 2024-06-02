import { MMKVStorage } from '@utils/mmkv/mmkv';
import * as RNFS from 'react-native-fs';

export const APP_STORAGE_KEY = 'APP_STORAGE_KEY';

const NOVEL_STORAGE_PATH = 'Novels';
const PLUGIN_STORAGE_PATH = 'Plugins';
const DEAFULT_ROOT_STORAGE = RNFS.ExternalDirectoryPath;

interface AppStorage {
  ROOT_STORAGE: string;
  NOVEL_STORAGE: string;
  PLUGIN_STORAGE: string;
}

/**
 * Call this funtion in a context instead of global.
 * Because if rootStorage is changed, app would not be updated if the function is called globally
 */
export const getAppStorages = (): AppStorage => {
  const rootStorage =
    MMKVStorage.getString(APP_STORAGE_KEY) || DEAFULT_ROOT_STORAGE;
  return {
    ROOT_STORAGE: rootStorage,
    NOVEL_STORAGE: rootStorage + '/' + NOVEL_STORAGE_PATH,
    PLUGIN_STORAGE: rootStorage + '/' + PLUGIN_STORAGE_PATH,
  };
};

export const setAppStorage = async (rootStorage: string) => {
  if (!(await RNFS.exists(rootStorage))) {
    throw new Error('Folder does not exist!');
  }
  const novelStorage = rootStorage + '/' + NOVEL_STORAGE_PATH;
  const pluginStorage = rootStorage + '/' + PLUGIN_STORAGE_PATH;
  for (const folder of [novelStorage, pluginStorage]) {
    if (await RNFS.exists(folder)) {
      console.log('existed');
      await RNFS.unlink(folder);
    }
    await RNFS.mkdir(pluginStorage);
  }
  MMKVStorage.set(APP_STORAGE_KEY, rootStorage);
};
