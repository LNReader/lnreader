import { exists, readDir, readFile } from '@api/drive';
import { BackupDataFileName, RestoreTask, TaskType } from '../types';
import { BackupCategory, BackupNovel } from '@database/types';
import { _restoreNovelAndChapters } from '@database/queries/NovelQueries';
import { _restoreCategory } from '@database/queries/CategoryQueries';
import { store } from '@redux/store';
import { RESTORE_NOVEL_STATE } from '@redux/novel/novel.types';
import { restorePluginState } from '@redux/plugins/pluginsSlice';
import { restorePreferenceState } from '@redux/preferences/preferencesSlice';
import { restoreSettingsState } from '@redux/settings/settingsSliceV1';
import { restoreSettingsState as restoreSettingsStateV2 } from '@redux/settings/settingsSliceV2';
import { RESTORE_TRACKER_STATE } from '@redux/tracker/tracker.types';
import { RESTORE_UPDATE_STATE } from '@redux/updates/updates.types';
import { RESTORE_DOWNLOADS_STATE } from '@redux/downloads/donwloads.types';
import { MMKVStorage } from '@utils/mmkv/mmkv';

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
        return readFile(file, 'json').then(state => {
          const subtask = async () => {
            store.dispatch({
              type: RESTORE_NOVEL_STATE,
              payload: state.novelReducer,
            });
            store.dispatch(restorePluginState(state.pluginsReducer));
            store.dispatch(restorePreferenceState(state.preferenceReducer));
            store.dispatch(restoreSettingsState(state.settingsReducerV1));
            store.dispatch(restoreSettingsStateV2(state.settingsReducerV2));
            store.dispatch({
              type: RESTORE_TRACKER_STATE,
              payload: state.trackerReducer,
            });
            store.dispatch({
              type: RESTORE_UPDATE_STATE,
              payload: state.updatesReducer,
            });
            store.dispatch({
              type: RESTORE_DOWNLOADS_STATE,
              payload: state.downloadsReducer,
            });
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

export const restoreTheme = (
  parentId: string,
): (() => Promise<RestoreTask>) => {
  return () =>
    exists(BackupDataFileName.THEME, false, parentId).then(file => {
      if (file) {
        return readFile(file, 'json').then(theme => {
          const subtask = async () => {
            for (let key of [
              'APP_THEME',
              'AMOLED_BLACK',
              'CUSTOM_ACCENT_COLOR',
            ]) {
              if (key in theme) {
                MMKVStorage.set(key, theme[key]);
              }
            }
          };
          return {
            taskType: TaskType.THEME,
            subtasks: [subtask],
          } as RestoreTask;
        });
      }
      return {
        taskType: TaskType.THEME,
        subtasks: [],
      };
    });
};
