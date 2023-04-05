import { History } from '@database/types';
import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash-es';
const db = SQLite.openDatabase('lnreader.db');

import { showToast } from '../../hooks/showToast';

const getHistoryQuery = `
    SELECT 
      Chapter.novelId, Novel.pluginId, Novel.name as novelName, Novel.url as novelUrl, Novel.cover as novelCover,
      Chapter.id, Chapter.name as chapterName, Chapter.url as chapterUrl, Chapter.bookmark, Chapter.readTime
    FROM Chapter 
    JOIN Novel
    ON Chapter.novelId = Novel.id AND Chapter.readTime IS NOT NULL
    ORDER BY readTime DESC
    `;

export const getHistoryFromDb = async (): Promise<History[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getHistoryQuery,
        [],
        (txObj, { rows }) => {
          resolve((rows as any)._array);
        },
        txnErrorCallback,
      );
    });
  });
};

export const insertHistory = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      "UPDATE Chapter SET readTime = datetime('now','localtime') WHERE id = ?",
      [chapterId],
      noop,
      txnErrorCallback,
    );
  });
};

export const deleteChapterHistory = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET readTime = NULL WHERE id = ?',
      [chapterId],
      noop,
      txnErrorCallback,
    );
  });
};

export const deleteAllHistory = async () => {
  db.transaction(tx => {
    tx.executeSql('UPDATE CHAPTER SET readTime = NULL');
  });
  showToast('History deleted.');
};
