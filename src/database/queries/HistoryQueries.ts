import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash-es';
const db = SQLite.openDatabase('lnreader.db');

import { showToast } from '../../hooks/showToast';
import { ExtendedChapter } from '@database/types';
import { getExtendedChapterByChapter } from './extendedChaptersQueries';

export const getHistoryFromDb = async (): Promise<ExtendedChapter[]> => {
  const query =
    'SELECT * FROM Chapter WHERE readTime IS NOT NULL ORDER BY readTime DESC';
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (txObj, { rows }) => {
          Promise.all(
            rows._array.map(chapter => getExtendedChapterByChapter(chapter)),
          ).then(chapters => resolve(chapters));
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
    tx.executeSql('UPDATE CHAPTER SET readTime = NULL', [], () =>
      showToast('History deleted.'),
    );
  });
};
