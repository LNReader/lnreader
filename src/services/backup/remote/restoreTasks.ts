import * as SQLite from 'expo-sqlite';
import RNFS from 'react-native-fs';

import { store } from '@redux/store';
import { ResponsePackage } from './types';
import { RESTORE_NOVEL_STATE } from '@redux/novel/novel.types';
import { restorePluginState } from '@redux/plugins/pluginsSlice';
import { RESTORE_PREFERENCE_STATE } from '@redux/preferences/preference.types';
import { RESTORE_SETTINGS_STATE } from '@redux/settings/settings.types';
import { restoreSettingsState } from '@redux/settings/settingsSlice';
import { RESTORE_TRACKER_STATE } from '@redux/tracker/tracker.types';
import { RESTORE_UPDATE_STATE } from '@redux/updates/updates.types';
import { RESTORE_DOWNLOADS_STATE } from '@redux/downloads/donwloads.types';
import { MMKVStorage } from '@utils/mmkv/mmkv';

import { createCategoryTriggerQuery } from '@database/tables/CategoryTable';
import { AppDownloadFolder } from '@utils/constants/download';

const db = SQLite.openDatabase('lnreader.db');

const insertObject = (record: any, table: string): Promise<void> => {
  const fields = Object.keys(record).join(', ');
  const values = Object.keys(record)
    .map(() => '?')
    .join(', ');
  const query = `INSERT OR IGNORE INTO ${table} (${fields}) VALUES (${values})`;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        Object.values(record),
        () => resolve(),
        error => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const insertTable = (records: any[], table: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`DELETE FROM ${table}`, [], () => {
        Promise.all(records.map((record: any) => insertObject(record, table)))
          .then(() => resolve())
          .catch(error => reject(error));
      });
    });
  });
};

export const checkAppVersion = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    responsePackage; // currently there's nothing to do
    resolve();
  });
};

export const restoreCategory = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    // this trigger could make sort mess up
    db.transaction(tx => {
      tx.executeSql('DROP TRIGGER if EXISTS add_category');
    });
    await insertTable(responsePackage.content, 'Category').catch(error =>
      reject(error),
    );
    db.transaction(tx => {
      tx.executeSql(createCategoryTriggerQuery);
    });
    resolve();
  });
};

export const restoreNovel = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(async tx => {
      tx.executeSql(
        'DELETE FROM Chapter',
        [],
        () =>
          insertTable(responsePackage.content, 'Novel').then(() => resolve()),
        error => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const restoreNovelCategory = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    insertTable(responsePackage.content, 'NovelCategory')
      .then(() => resolve())
      .catch(error => reject(error));
  });
};

export const restoreChapter = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const chapters: any[] = responsePackage.content;
    Promise.all(chapters.map(chapter => insertObject(chapter, 'Chapter')))
      .then(() => resolve())
      .catch(error => reject(error));
  });
};

export const restoreDownload = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const realPath = `${AppDownloadFolder}/${responsePackage.relative_path}`;
    const folderPath = realPath.split('/').slice(0, -1).join('/');
    RNFS.exists(folderPath)
      .then(exists => {
        if (!exists) {
          return RNFS.mkdir(folderPath);
        }
        return new Promise(_resolve => _resolve(null));
      })
      .then(() => RNFS.writeFile(realPath, responsePackage.content, 'base64'))
      .then(() => resolve())
      .catch(error => reject(error));
  });
};

export const restoreSetting = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    const state = responsePackage.content;
    store.dispatch({ type: RESTORE_NOVEL_STATE, payload: state.novelReducer });
    store.dispatch(restorePluginState(state.pluginsReducer));
    store.dispatch({
      type: RESTORE_PREFERENCE_STATE,
      payload: state.preferenceReducer,
    });
    store.dispatch({
      type: RESTORE_SETTINGS_STATE,
      payload: state.settingsReducer,
    });
    store.dispatch(restoreSettingsState(state.settingsReducerV2));
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
    resolve();
  });
};

export const restoreTheme = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resovle => {
    const theme = responsePackage.content;
    for (let key of ['APP_THEME', 'AMOLED_BLACK', 'CUSTOM_ACCENT_COLOR']) {
      if (key in theme) {
        MMKVStorage.set(key, theme[key]);
      }
    }
    resovle();
  });
};
