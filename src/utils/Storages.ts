import FileManager from '@native/FileManager';
import { MMKVStorage } from '@utils/mmkv/mmkv';

export const APP_STORAGE_KEY = 'APP_STORAGE_KEY';

const NOVEL_STORAGE_PATH = 'Novels';
const PLUGIN_STORAGE_PATH = 'Plugins';
const DEFAULT_ROOT_STORAGE = FileManager.ExternalDirectoryPath;
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
    MMKVStorage.getString(APP_STORAGE_KEY) || DEFAULT_ROOT_STORAGE;
  return {
    ROOT_STORAGE: rootStorage,
    NOVEL_STORAGE: rootStorage + '/' + NOVEL_STORAGE_PATH,
    PLUGIN_STORAGE: rootStorage + '/' + PLUGIN_STORAGE_PATH,
  };
};

export const setAppStorage = async (rootStorage: string) => {
  if (!(await FileManager.exists(rootStorage))) {
    throw new Error('Folder does not exist!');
  }
  const novelStorage = rootStorage + '/' + NOVEL_STORAGE_PATH;
  const pluginStorage = rootStorage + '/' + PLUGIN_STORAGE_PATH;
  for (const folder of [novelStorage, pluginStorage]) {
    await FileManager.mkdir(folder);
  }
  MMKVStorage.set(APP_STORAGE_KEY, rootStorage);
};
