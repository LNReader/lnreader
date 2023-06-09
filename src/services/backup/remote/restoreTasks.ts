import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import RNFS from 'react-native-fs';

import { pluginsFolder } from '@plugins/pluginManager';
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

const db = SQLite.openDatabase('lnreader.db');
const downloadDirectoryPath = `${RNFS.DownloadDirectoryPath}/LNReader`;

const insertObject = (record: any, table: string): Promise<void> => {
  const fields = Object.keys(record).join(', ');
  const values = Object.keys(record)
    .map(() => '?')
    .join(', ');
  const query = `INSERT OR IGNORE INTO ${table} (${fields}) VALUES (${values})`;
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        Object.values(record),
        () => resolve(),
        txnErrorCallback,
      );
    });
  });
};

const insertTable = (records: any[], table: string): Promise<void> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(`DELETE FROM ${table}`, [], () => {
        Promise.all(
          records.map((record: any) => insertObject(record, table)),
        ).then(() => resolve());
      });
    });
  });
};

export const restoreCategory = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    insertTable(responsePackage.content, 'Category').then(() => resolve());
  });
};

export const restoreNovel = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    db.transaction(async tx => {
      tx.executeSql('DELETE FROM Download');
      tx.executeSql(
        'DELETE FROM Chapter',
        [],
        () =>
          insertTable(responsePackage.content, 'Novel').then(() => resolve()),
        txnErrorCallback,
      );
    });
  });
};

export const restoreNovelCategory = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    insertTable(responsePackage.content, 'NovelCategory').then(() => resolve());
  });
};

export const restoreChapter = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    const chapters: any[] = responsePackage.content;
    Promise.all(chapters.map(chapter => insertObject(chapter, 'Chapter'))).then(
      () => resolve(),
    );
  });
};

export const restoreDownload = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    const chapterText = responsePackage.content;
    const chapterId = responsePackage.relative_path?.split('.')[0];
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Download(chapterId, chapterText) VALUES (?, ?)',
        [chapterId, chapterText],
        () => resolve(),
        txnErrorCallback,
      );
    });
  });
};

export const restoreImage = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    const realPath = `${downloadDirectoryPath}/${responsePackage.relative_path}`;
    const folderPath = realPath.split('/').slice(0, -1).join('/');
    RNFS.exists(folderPath)
      .then(exists => {
        if (!exists) {
          return RNFS.mkdir(folderPath);
        }
        return new Promise(resolve => resolve(null));
      })
      .then(() => RNFS.writeFile(realPath, responsePackage.content, 'base64'))
      .then(() => resolve());
  });
};

export const restorePlugin = (
  responsePackage: ResponsePackage,
): Promise<void> => {
  return new Promise(resolve => {
    const realPath = `${pluginsFolder}/${responsePackage.relative_path}`;
    RNFS.writeFile(realPath, responsePackage.content).then(() => resolve());
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
    MMKVStorage.set('APP_THEME', theme.APP_THEME);
    MMKVStorage.set('AMOLED_BLACK', theme.AMOLED_BLACK);
    MMKVStorage.set('CUSTOM_ACCENT_COLOR', theme.CUSTOM_ACCENT_COLOR);
    resovle();
  });
};
