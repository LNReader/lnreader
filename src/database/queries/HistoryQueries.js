import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

import { showToast } from '../../hooks/showToast';

const getHistoryQuery = `
    SELECT history.*, chapters.*, novels.*
    FROM history 
    JOIN chapters 
    ON history.historyChapterId = chapters.chapterId
    JOIN novels
    ON history.historyNovelId = novels.novelId
    GROUP BY novels.novelId
    HAVING history.historyTimeRead = MAX(history.historyTimeRead)
    ORDER BY history.historyTimeRead DESC
    `;

export const getHistoryFromDb = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        getHistoryQuery,
        null,
        (txObj, { rows: { _array } }) => {
          resolve(_array);
        },
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    });
  });
};

// const insertHistoryQuery =

export const insertHistory = async (novelId, chapterId) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT OR REPLACE INTO history (historyNovelId, historyChapterId, historyTimeRead) VALUES (?, ?, (datetime('now','localtime')))",
      [novelId, chapterId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
    tx.executeSql('UPDATE novels SET unread = 0 WHERE novelId = ?', [novelId]);
  });
};

export const deleteHistory = async historyId => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM history WHERE historyId = ?',
      [historyId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

export const deleteAllHistory = async () => {
  db.transaction(tx => {
    tx.executeSql('DELETE FROM history; VACCUM;');
  });
  showToast('History deleted.');
};
