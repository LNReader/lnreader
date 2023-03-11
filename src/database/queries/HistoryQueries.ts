import { History } from '@database/types';
import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash-es';
const db = SQLite.openDatabase('lnreader.db');

import { showToast } from '../../hooks/showToast';

const getHistoryQuery = `
    SELECT 
      History.id, History.readTime,
      Chapter.novelId, Novel.pluginId, Novel.name as novelName, Novel.url as novelUrl, Novel.cover as novelCover,
      History.chapterId, Chapter.name as chapterName, Chapter.url as chapterUrl, Chapter.bookmark
    FROM History 
    JOIN Chapter 
    ON History.chapterId = Chapter.id
    JOIN Novel
    ON Chapter.novelId = Novel.id
    ORDER BY History.readTime DESC
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

// const insertHistoryQuery =

export const insertHistory = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT OR REPLACE INTO History (chapterId, readTime) VALUES (?, (datetime('now','localtime')))",
      [chapterId],
      noop,
      txnErrorCallback,
    );
  });
};

export const deleteChapterHistory = async (historyId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM History WHERE id = ?',
      [historyId],
      noop,
      txnErrorCallback,
    );
  });
};

export const deleteAllHistory = async () => {
  db.transaction(tx => {
    tx.executeSql('DELETE FROM History; VACCUM;');
  });
  showToast('History deleted.');
};
