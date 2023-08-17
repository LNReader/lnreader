import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import RNFS, { ReadDirItem } from 'react-native-fs';
import { appVersion } from '@utils/versionUtils';
import { ChapterInfo, NovelInfo } from '@database/types';
import { getChapterFromDB } from '@database/queries/ChapterQueries';
import { pluginsFolder } from '@plugins/pluginManager';
import { store } from '@redux/store';
import {
  DataFilePath,
  DataFolderPath,
  RequestPackage,
  BackupTask,
  TaskType,
} from './types';
import { MMKVStorage } from '@utils/mmkv/mmkv';

const db = SQLite.openDatabase('lnreader.db');
const downloadDirectoryPath = `${RNFS.DownloadDirectoryPath}/LNReader`;

export const versionTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    const requestPackage: RequestPackage = {
      taskType: TaskType.Version,
      content: {
        version: appVersion,
      },
      relative_path: DataFilePath.Version,
    };
    resolve({
      taskType: TaskType.Version,
      subtasks: [async () => requestPackage],
    });
  });
};

export const categoryTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Category',
        [],
        (txObj, { rows }) => {
          const requestPackage: RequestPackage = {
            taskType: TaskType.Category,
            content: rows._array,
            relative_path: DataFilePath.Category,
          };
          resolve({
            taskType: TaskType.Category,
            subtasks: [async () => requestPackage],
          } as BackupTask);
        },
        txnErrorCallback,
      );
    });
  });
};

export const novelTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Novel',
        [],
        (txObj, { rows }) => {
          const requestPackage: RequestPackage = {
            taskType: TaskType.Novel,
            content: rows._array.map((novel: NovelInfo) => {
              if (novel.cover && !novel.cover.startsWith('http')) {
                novel.cover = `${downloadDirectoryPath}/${novel.pluginId}/${novel.id}/Cover.jpg`;
              }
              return novel;
            }),
            relative_path: DataFilePath.Novel,
          };
          resolve({
            taskType: TaskType.Novel,
            subtasks: [async () => requestPackage],
          } as BackupTask);
        },
        txnErrorCallback,
      );
    });
  });
};

export const novelCoverTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Novel WHERE cover NOT LIKE "http%"',
        [],
        (txObj, { rows }) => {
          const subtasks = rows._array
            .filter((novel: NovelInfo) => novel.cover)
            .map((novel: NovelInfo) => {
              const subtask = async () => {
                let base64 = '';
                if (novel.cover) {
                  base64 = await RNFS.readFile(novel.cover, 'base64');
                }
                return {
                  taskType: TaskType.NovelCover,
                  content: base64,
                  encoding: 'base64',
                  relative_path: `${novel.pluginId}/${novel.id}/Cover.jpg`,
                } as RequestPackage;
              };
              return subtask;
            });
          resolve({
            taskType: TaskType.NovelCover,
            subtasks: subtasks,
          } as BackupTask);
        },
        txnErrorCallback,
      );
    });
  });
};

export const novelCategoryTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM NovelCategory',
        [],
        (txObj, { rows }) => {
          const requestPackage: RequestPackage = {
            taskType: TaskType.NovelCategory,
            content: rows._array,
            relative_path: DataFilePath.NovelCatgory,
          };
          resolve({
            taskType: TaskType.NovelCategory,
            subtasks: [async () => requestPackage],
          } as BackupTask);
        },
        txnErrorCallback,
      );
    });
  });
};

const getChaptersByNovelId = (novelId: number): Promise<ChapterInfo[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE novelId = ?',
        [novelId],
        (txObj, { rows }) => resolve(rows._array),
      );
    });
  });
};

export const chapterTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id FROM Novel',
        [],
        (txObj, { rows }) => {
          const subtasks = rows._array.map((novel: NovelInfo) => {
            const subtask = async () => {
              const chapters = await getChaptersByNovelId(novel.id);
              const requestPackage: RequestPackage = {
                taskType: TaskType.Chapter,
                content: chapters,
                relative_path: `${DataFolderPath.Chapter}/${novel.id}.json`,
              };
              return requestPackage;
            };
            return subtask;
          });
          resolve({ taskType: TaskType.Chapter, subtasks: subtasks });
        },
        txnErrorCallback,
      );
    });
  });
};

export const downloadTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id from Chapter WHERE isDownloaded = 1',
        [],
        (txObj, { rows }) => {
          const subtasks = rows._array.map((chapter: ChapterInfo) => {
            const subtask = async () => {
              const chapterText = await getChapterFromDB(chapter.id);
              const requestPackage: RequestPackage = {
                taskType: TaskType.Download,
                content: chapterText,
                relative_path: `${DataFolderPath.Download}/${chapter.id}.html`,
                encoding: 'utf-8',
              };
              return requestPackage;
            };
            return subtask;
          });
          resolve({ taskType: TaskType.Download, subtasks: subtasks });
        },
        txnErrorCallback,
      );
    });
  });
};

export const imageTask = (): Promise<BackupTask> => {
  return new Promise(async (resolve, reject) => {
    try {
      const walkDir = async (items: ReadDirItem[]) => {
        let paths: string[] = [];
        for (let item of items) {
          if (item.isFile()) {
            paths.push(item.path);
          } else {
            const _items = await RNFS.readDir(item.path);
            paths = paths.concat(await walkDir(_items));
          }
        }
        return paths;
      };
      const downloadDir = `${RNFS.DownloadDirectoryPath}/LNReader`;
      let paths: string[] = [];
      if (await RNFS.exists(downloadDir)) {
        const items = await RNFS.readDir(downloadDir);
        paths = await walkDir(items);
      }
      const subtasks = paths.map(path => {
        const subtask = async () => {
          const base64 = await RNFS.readFile(path, 'base64');
          return {
            taskType: TaskType.Image,
            encoding: 'base64',
            content: base64,
            relative_path: path.split('/').slice(-4).join('/'),
          } as RequestPackage;
        };
        return subtask;
      });
      resolve({ taskType: TaskType.Image, subtasks: subtasks });
    } catch (error) {
      reject(error);
    }
  });
};

export const pluginTask = (): Promise<BackupTask> => {
  return RNFS.readDir(pluginsFolder).then(items => {
    const subtasks = items.map(item => {
      const subtask = async () => {
        const script = await RNFS.readFile(item.path);
        return {
          taskType: TaskType.Plugin,
          relative_path: item.path.split('/').slice(-2).join('/'),
          content: script,
          encoding: 'utf-8',
        } as RequestPackage;
      };
      return subtask;
    });
    return { taskType: TaskType.Plugin, subtasks: subtasks };
  });
};

export const settingTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    const state = store.getState();
    state.trackerReducer = {
      'tracker': null,
      'trackedNovels': [],
    };
    const requestPackage = {
      taskType: TaskType.Setting,
      content: state,
      relative_path: DataFilePath.Setting,
    } as RequestPackage;
    resolve({
      taskType: TaskType.Setting,
      subtasks: [async () => requestPackage],
    });
  });
};

export const themeTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    const APP_THEME = MMKVStorage.getString('APP_THEME');
    const AMOLED_BLACK = MMKVStorage.getBoolean('AMOLED_BLACK');
    const CUSTOM_ACCENT_COLOR = MMKVStorage.getString('CUSTOM_ACCENT_COLOR');
    const requestPackage = {
      taskType: TaskType.Theme,
      content: {
        APP_THEME,
        AMOLED_BLACK,
        CUSTOM_ACCENT_COLOR,
      },
      relative_path: DataFilePath.Theme,
    } as RequestPackage;
    resolve({
      taskType: TaskType.Theme,
      subtasks: [async () => requestPackage],
    });
  });
};
