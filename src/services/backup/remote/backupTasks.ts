import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import RNFS from 'react-native-fs';

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

const db = SQLite.openDatabase('lnreader.db');
const downloadDirectoryPath = `${RNFS.DownloadDirectoryPath}/LNReader`;

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
              if (novel.cover && novel.cover.startsWith('http')) {
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
        'SELECT * FROM Novel WHERE Cover NOT LIKE "http%"',
        [],
        (txObj, { rows }) => {
          const subtasks = rows._array.map((novel: NovelInfo) => {
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
                relative_path: `${DataFolderPath.Chapter}/${novel.id}`,
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
  return RNFS.readDir(`${RNFS.DownloadDirectoryPath}/LNReader`)
    .then(pluginDirs =>
      Promise.all(
        pluginDirs
          .filter(dir => dir.isDirectory())
          .map(dir => RNFS.readDir(dir.path)),
      ),
    )
    .then(novelDirss => {
      const novelDirs = novelDirss.reduce((res, dirs) => res.concat(dirs), []); // [][] => []
      return Promise.all(
        novelDirs
          .filter(dir => dir.isDirectory())
          .map(dir => RNFS.readDir(dir.path)),
      );
    })
    .then(chapterDirss => {
      const chapterDirs = chapterDirss.reduce(
        (res, dirs) => res.concat(dirs),
        [],
      );
      return Promise.all(
        chapterDirs
          .filter(dir => dir.isDirectory())
          .map(dir => RNFS.readDir(dir.path)),
      );
    })
    .then(imagePathss => {
      const imagePaths = imagePathss
        .reduce((res, items) => res.concat(items), [])
        .map(item => item.path);
      const subtasks = imagePaths
        .filter(path => !path.endsWith('.nomedia'))
        .map(path => {
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
      return { taskType: TaskType.Image, subtasks: subtasks };
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
    const requestPackage = {
      taskType: TaskType.Setting,
      content: store.getState(),
      relative_path: DataFilePath.Setting,
    } as RequestPackage;
    resolve({
      taskType: TaskType.Setting,
      subtasks: [async () => requestPackage],
    });
  });
};
