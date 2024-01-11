import { BackupDataFileName, RestoreTask, TaskType } from '../types';
import { BackupCategory, BackupNovel } from '@database/types';
import { _restoreNovelAndChapters } from '@database/queries/NovelQueries';
import { _restoreCategory } from '@database/queries/CategoryQueries';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { download, exists, getJson, list } from '@api/remote';

export const restoreNovel = (
  host: string,
  folderTree: string[],
): (() => Promise<RestoreTask>) => {
  return () =>
    list(host, folderTree).then(files => {
      const subtasks = files.map(file => {
        return (): Promise<void> => {
          return getJson(host, folderTree, file).then((novel: BackupNovel) =>
            _restoreNovelAndChapters(novel),
          );
        };
      });
      return {
        taskType: TaskType.NOVEL_AND_CHAPTERS,
        subtasks: subtasks,
      };
    });
};

export const restoreCategory = (
  host: string,
  folderTree: string[],
): (() => Promise<RestoreTask>) => {
  return () =>
    exists(host, folderTree, BackupDataFileName.CATEGORY).then(existed => {
      if (existed) {
        return getJson(host, folderTree, BackupDataFileName.CATEGORY).then(
          (categories: BackupCategory[]) => {
            const subtasks = categories.map(category => {
              return async () => _restoreCategory(category);
            });
            return {
              taskType: TaskType.CATEGORY,
              subtasks: subtasks,
            } as RestoreTask;
          },
        );
      }
      return {
        taskType: TaskType.CATEGORY,
        subtasks: [],
      };
    });
};

export const retoreDownload = (
  host: string,
  folderTree: string[],
): (() => Promise<RestoreTask>) => {
  return () =>
    list(host, folderTree).then(files => {
      return {
        taskType: TaskType.DOWNLOAD,
        subtasks: files.map(file => () => download(host, folderTree, file)),
      };
    });
};

export const restoreSetting = (
  host: string,
  folderTree: string[],
): (() => Promise<RestoreTask>) => {
  return () =>
    exists(host, folderTree, BackupDataFileName.SETTING).then(existed => {
      if (existed) {
        return getJson(host, folderTree, BackupDataFileName.SETTING).then(
          data => {
            const subtask = async () => {
              for (let key in data) {
                MMKVStorage.set(key, data[key]);
              }
            };
            return {
              taskType: TaskType.SETTING,
              subtasks: [subtask],
            } as RestoreTask;
          },
        );
      }
      return {
        taskType: TaskType.SETTING,
        subtasks: [],
      };
    });
};
