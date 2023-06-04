import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import RNFS from 'react-native-fs';

import { Chapter, Novel } from '@database/types';

const db = SQLite.openDatabase('lnreader.db');
const downloadDirectoryPath = `${RNFS.DownloadDirectoryPath}/LNReader`;

export enum DataPath {
  Category = 'Category.json',
  Novel = 'Novel.json',
  NovelCatgory = 'NovelCategory.json',
  Settings = 'Settings.json',
}

export interface RequestPackage {
  type: string;
  content: any;
  encode?: string; // 'base64', 'utf-8',
  relative_path: string | DataPath;
}

export interface BackupTask {
  type: string; // for notification
  // Images or ChapterText could be large, so transfer it one by one
  subtasks: Array<() => Promise<RequestPackage>>;
}

export const categoryTask = (): Promise<BackupTask> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Category',
        [],
        (txObj, { rows }) => {
          const requestPackage: RequestPackage = {
            type: 'Category',
            content: rows._array,
            relative_path: DataPath.Category,
          };
          resolve({
            type: 'Category',
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
            type: 'Novel',
            content: rows._array.map((novel: Novel) => {
              if (novel.cover && novel.cover.startsWith('http')) {
                novel.cover = `${downloadDirectoryPath}/${novel.pluginId}/${novel.id}/Cover.jpg`;
              }
              return novel;
            }),
            relative_path: DataPath.Novel,
          };
          resolve({
            type: 'Novel',
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
          const subtasks = rows._array.map((novel: Novel) => {
            const subtask = async () => {
              let base64 = '';
              if (novel.cover) {
                base64 = await RNFS.readFile(novel.cover, 'base64');
              }
              return {
                type: 'NovelCover',
                content: base64,
                encode: 'base64',
                relative_path: `${novel.pluginId}/${novel.id}/Cover.jpg`,
              } as RequestPackage;
            };
            return subtask;
          });
          resolve({ type: 'NovelCover', subtasks: subtasks } as BackupTask);
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
            type: 'NovelCategory',
            content: rows._array,
            relative_path: DataPath.NovelCatgory,
          };
          resolve({
            type: 'NovelCategory',
            subtasks: [async () => requestPackage],
          } as BackupTask);
        },
        txnErrorCallback,
      );
    });
  });
};

const getChaptersByNovelId = (novelId: number): Promise<Chapter[]> => {
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
          const subtasks = rows._array.map((novel: Novel) => {
            const subtask = async () => {
              const chapters = await getChaptersByNovelId(novel.id);
              const requestPackage: RequestPackage = {
                type: 'Chapter',
                content: chapters,
                relative_path: `Chapters/${novel.id}-Chapters`,
              };
              return requestPackage;
            };
            return subtask;
          });
          resolve({ type: 'Chapter', subtasks: subtasks });
        },
        txnErrorCallback,
      );
    });
  });
};
