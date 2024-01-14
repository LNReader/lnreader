import { exists, readDir, readFile } from '@api/drive';
import { BackupDataFileName, RestoreTask, TaskType } from '../types';
import { BackupCategory, BackupNovel } from '@database/types';
import { _restoreNovelAndChapters } from '@database/queries/NovelQueries';
import { _restoreCategory } from '@database/queries/CategoryQueries';
import { restoreMMKVData } from '../utils';

export const restoreNovel = (
  parentId: string,
): (() => Promise<RestoreTask>) => {
  return () =>
    readDir(parentId).then(files => {
      const subtasks = files.map(file => {
        return (): Promise<void> => {
          return readFile(file, 'json').then((novel: BackupNovel) =>
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
  parentId: string,
): (() => Promise<RestoreTask>) => {
  return () =>
    exists(BackupDataFileName.CATEGORY, false, parentId).then(file => {
      if (file) {
        return readFile(file, 'json').then((categories: BackupCategory[]) => {
          const subtasks = categories.map(category => {
            return async () => _restoreCategory(category);
          });
          return {
            taskType: TaskType.CATEGORY,
            subtasks: subtasks,
          } as RestoreTask;
        });
      }
      return {
        taskType: TaskType.CATEGORY,
        subtasks: [],
      };
    });
};

export const retoreDownload = (
  parentId: string,
): (() => Promise<RestoreTask>) => {
  return () =>
    readDir(parentId).then(files => {
      return {
        taskType: TaskType.DOWNLOAD,
        subtasks: files.map(file => () => readFile(file, 'media')),
      };
    });
};

export const restoreSetting = (
  parentId: string,
): (() => Promise<RestoreTask>) => {
  return () =>
    exists(BackupDataFileName.SETTING, false, parentId).then(file => {
      if (file) {
        return readFile(file, 'json').then(data => {
          const subtask = async () => {
            restoreMMKVData(data);
          };
          return {
            taskType: TaskType.SETTING,
            subtasks: [subtask],
          } as RestoreTask;
        });
      }
      return {
        taskType: TaskType.SETTING,
        subtasks: [],
      };
    });
};
