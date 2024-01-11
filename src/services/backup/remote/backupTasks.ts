import { appVersion } from '@utils/versionUtils';

import { MMKVStorage } from '@utils/mmkv/mmkv';
import {
  AppDownloadFolder,
  NovelDownloadFolder,
} from '@utils/constants/download';
import { walkDir } from '../utils';
import {
  BackupPackage,
  BackupTask,
  BackupDataFileName,
  TaskType,
} from '../types';
import {
  getAllNovels,
  getNovelsWithCustomCover,
} from '@database/queries/NovelQueries';
import { getChapters } from '@database/queries/ChapterQueries';
import {
  getAllNovelCategories,
  getCategoriesFromDb,
} from '@database/queries/CategoryQueries';

export const versionTask = async (
  folderTree: string[],
): Promise<BackupTask> => {
  const backupPackage: BackupPackage = {
    folderTree,
    content: JSON.stringify({
      version: appVersion,
    }),
    name: BackupDataFileName.VERSION,
    mimeType: 'application/json',
  };
  return {
    taskType: TaskType.VERSION,
    subtasks: [async () => backupPackage],
  };
};

export const novelTask = async (folderTree: string[]): Promise<BackupTask> => {
  return getAllNovels().then(novels => {
    const subtasks = novels.map(novel => {
      if (novel.cover && !novel.cover.startsWith('http')) {
        novel.cover = `file:///${NovelDownloadFolder}/${novel.pluginId}/${novel.id}/cover.png`;
      }
      return (): Promise<BackupPackage> =>
        getChapters(novel.id).then(chapters => {
          return {
            folderTree: folderTree,
            name: novel.id + '.json',
            content: JSON.stringify({
              chapters: chapters,
              ...novel,
            }),
            mimeType: 'application/json',
          };
        });
    });
    return {
      taskType: TaskType.NOVEL_AND_CHAPTERS,
      subtasks: subtasks,
    };
  });
};

export const novelCoverTask = (folderTree: string[]): Promise<BackupTask> => {
  return getNovelsWithCustomCover().then(novels => {
    return {
      taskType: TaskType.NOVEL_COVER,
      subtasks: novels.map(novel => {
        return async (): Promise<BackupPackage> => {
          return {
            folderTree,
            name: `${NovelDownloadFolder}/${novel.pluginId}/${novel.id}/cover.png`.replace(
              AppDownloadFolder + '/',
              '',
            ),
            mimeType: 'image/png',
            content: novel.cover || '',
          };
        };
      }),
    };
  });
};

export const categoryTask = (folderTree: string[]): Promise<BackupTask> => {
  return getCategoriesFromDb().then(categories => {
    const task = async (): Promise<BackupPackage> => {
      return getAllNovelCategories().then(novelCategories => {
        return {
          folderTree,
          name: BackupDataFileName.CATEGORY,
          mimeType: 'application/json',
          content: JSON.stringify(
            categories.map(category => {
              return {
                ...category,
                novelIds: novelCategories
                  .filter(nc => nc.categoryId === category.id)
                  .map(nc => nc.novelId),
              };
            }),
          ),
        };
      });
    };
    return {
      taskType: TaskType.CATEGORY,
      subtasks: [task],
    };
  });
};

export const downloadTask = (folderTree: string[]): Promise<BackupTask> => {
  return walkDir(AppDownloadFolder).then(items => {
    return {
      taskType: TaskType.DOWNLOAD,
      subtasks: items.map(item => {
        return async (): Promise<BackupPackage> => {
          return {
            folderTree,
            name: item.path.replace(AppDownloadFolder + '/', ''),
            content: item.uri,
            mimeType: item.mimeType,
          };
        };
      }),
    };
  });
};

export const settingTask = async (
  folderTree: string[],
): Promise<BackupTask> => {
  const keys = MMKVStorage.getAllKeys();
  const data = keys.map(key => {
    return {
      [key]: MMKVStorage.getString(key),
    };
  });
  const backupPackage: BackupPackage = {
    folderTree,
    name: BackupDataFileName.SETTING,
    mimeType: 'application/json',
    content: JSON.stringify(data),
  };
  return {
    taskType: TaskType.SETTING,
    subtasks: [async () => backupPackage],
  };
};
