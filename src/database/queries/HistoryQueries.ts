import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash-es';
const db = SQLite.openDatabase('lnreader.db');

import { showToast } from '../../hooks/showToast';

const getHistoryQuery = `
    SELECT History.*, Chapter.*, Novel.*
    FROM History 
    JOIN Chapter 
    ON History.chapterId = Chapter.id
    JOIN Novel
    ON Chapter.novelId = Novel.id
    GROUP BY Novel.id
    HAVING History.readTime = MAX(History.readTime)
    ORDER BY History.readTime DESC
    `;

export const getHistoryFromDb = async () => {
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
      "INSERT OR REPLACE INTO History (chapterId, readTime) VALUES (?, ?, (datetime('now','localtime')))",
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
