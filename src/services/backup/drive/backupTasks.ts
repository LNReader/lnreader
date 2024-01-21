import {
  BackupPackage,
  BackupTask,
  BackupDataFileName,
  TaskType,
} from '../types';
import { appVersion } from '@utils/versionUtils';
import { getAllNovels } from '@database/queries/NovelQueries';
import { AppDownloadFolder } from '@utils/constants/download';
import { getChapters } from '@database/queries/ChapterQueries';
import {
  getCategoriesFromDb,
  getAllNovelCategories,
} from '@database/queries/CategoryQueries';
import { walkDir, backupMMKVData } from '../utils';

export const versionTask = async (parentId: string): Promise<BackupTask> => {
  const backupPackage: BackupPackage = {
    folderTree: [parentId],
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

export const novelTask = async (parentId: string): Promise<BackupTask> => {
  return getAllNovels().then(novels => {
    const subtasks = novels.map(novel => {
      return (): Promise<BackupPackage> =>
        getChapters(novel.id).then(chapters => {
          return {
            folderTree: [parentId],
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

export const categoryTask = (parentId: string): Promise<BackupTask> => {
  return getCategoriesFromDb().then(categories => {
    const task = async (): Promise<BackupPackage> => {
      return getAllNovelCategories().then(novelCategories => {
        return {
          folderTree: [parentId],
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

export const downloadTask = (parentId: string): Promise<BackupTask> => {
  return walkDir(AppDownloadFolder).then(items => {
    return {
      taskType: TaskType.DOWNLOAD,
      subtasks: items.map(item => {
        return async (): Promise<BackupPackage> => {
          return {
            folderTree: [parentId],
            name: item.path.replace(AppDownloadFolder + '/', ''),
            content: item.uri,
            mimeType: item.mimeType,
          };
        };
      }),
    };
  });
};

export const settingTask = async (parentId: string): Promise<BackupTask> => {
  const data = backupMMKVData();
  const backupPackage: BackupPackage = {
    folderTree: [parentId],
    name: BackupDataFileName.SETTING,
    mimeType: 'application/json',
    content: JSON.stringify(data),
  };
  return {
    taskType: TaskType.SETTING,
    subtasks: [async () => backupPackage],
  };
};
