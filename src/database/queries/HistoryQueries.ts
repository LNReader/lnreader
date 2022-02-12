import * as SQLite from 'expo-sqlite';

import {History} from '../types';
import {updateNovelUnreadInDbQuery} from './NovelQueries';

const db = SQLite.openDatabase('lnreader.db');

const getHistoryQuery = `
    SELECT 
      history.*, 
      chapters.*, 
      novels.*
    FROM 
      history 
    JOIN 
      chapters 
    ON 
      history.historyChapterId = chapters.chapterId
    JOIN 
      novels
    ON 
      history.historyNovelId = novels.novelId
    GROUP BY 
      novels.novelId
    HAVING 
      history.historyTimeRead = MAX(history.historyTimeRead)
    ORDER BY 
    history.historyTimeRead DESC
    `;

export const getHistoryFromDb = async (): Promise<History[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        getHistoryQuery,
        [],
        (txObj, {rows: {_array}}) => resolve(_array),
        (txObj, error) => {
          reject(error);
          return true;
        },
      );
    });
  });
};

const insertHistoryInDbQuery = `
  INSERT OR REPLACE INTO 
    history (
      historyNovelId, 
      historyChapterId, 
      historyTimeRead
    ) 
  VALUES 
    (
      ?, ?, (datetime('now','localtime'))
    )
  `;

export const insertHistoryInDb = async (novelId: number, chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      insertHistoryInDbQuery,
      [novelId, chapterId],
      (txObj, res) => {},
      (txObj, error) => {},
    );
    tx.executeSql(updateNovelUnreadInDbQuery, [novelId]);
  });
};

const deleteChapterHistoryQuery = `
  DELETE FROM 
    history 
  WHERE 
    historyId = ?
  `;

export const deleteChapterHistory = async (historyId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      deleteChapterHistoryQuery,
      [historyId],
      (txObj, res) => {},
      (txObj, error) => {},
    );
  });
};

const deleteAllHistoryQuery = `
  DELETE FROM 
    history;
  `;

export const deleteAllHistory = async () => {
  db.transaction(tx => {
    tx.executeSql(
      deleteAllHistoryQuery,
      [],
      (txObj, res) => {},
      (txObj, error) => {},
    );
  });
};
