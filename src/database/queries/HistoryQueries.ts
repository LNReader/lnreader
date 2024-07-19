import { History } from '@database/types';
import { txnErrorCallback } from '@database/utils/helpers';
import { noop } from 'lodash-es';

import { showToast } from '../../utils/showToast';
import { getString } from '@strings/translations';
import getDb from '@database/openDB';

const getHistoryQuery = `
    SELECT 
      Chapter.*, Novel.pluginId, Novel.name as novelName, Novel.path as novelPath, Novel.cover as novelCover, Novel.id as novelId
    FROM Chapter 
    JOIN Novel
    ON Chapter.novelId = Novel.id AND Chapter.readTime IS NOT NULL
    GROUP BY novelId
    HAVING readTime = MAX(readTime)
    ORDER BY readTime DESC
    `;

export const getHistoryFromDb = async (): Promise<History[]> => {
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql('UPDATE CHAPTER SET readTime = NULL');
  });
  showToast(getString('historyScreen.deleted'));
};
