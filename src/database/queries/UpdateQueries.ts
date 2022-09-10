/* eslint-disable @typescript-eslint/no-unused-vars */

import * as SQLite from 'expo-sqlite';
import { showToast } from '../../hooks/showToast';
import { Update } from '../types';

const db = SQLite.openDatabase('lnreader.db');

const getUpdatesFromDbQuery = `
    SELECT 
      chapters.chapterId, 
      chapters.read, 
      chapters.downloaded, 
      chapters.chapterUrl, 
      chapters.chapterName,
      chapters.bookmark,
      chapters.releaseDate,
      novels.novelUrl, 
      novels.novelId, 
      novels.novelCover, 
      novels.novelName, 
      novels.sourceId, 
      updates.updateTime, 
      updates.updateId
    FROM 
      updates 
    JOIN 
      chapters 
    ON 
      updates.chapterId = chapters.chapterId
    JOIN 
      novels
    ON 
      updates.novelId = novels.novelId
    WHERE 
      date(updates.updateTime) > date('now','-3 months')
    ORDER BY 
      updates.updateTime DESC, chapters.chapterName DESC, chapters.releaseDate DESC
    `;

export const getUpdatesFromDb = async (): Promise<Update[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        getUpdatesFromDbQuery,
        [],
        (txObj, { rows: { _array } }) => resolve(_array),
        (txObj, error) => reject(error),
      );
    });
  });
};

const insertChapterUpdateQuery = `
  INSERT OR IGNORE INTO 
    updates 
    (chapterId, novelId, updateTime) 
  VALUES 
    (?, ?, (datetime('now','localtime')))`;

export const insertChapterUpdate = async (
  chapterId: number,
  novelId: number,
) => {
  db.transaction(tx => {
    tx.executeSql(
      insertChapterUpdateQuery,
      [chapterId, novelId],
      (txOBJ, res) => {},
      (txOBJ, error) => showToast(error.message),
    );
  });
};

const deleteUpdateFromDbQuery = `
    DELETE FROM 
      updates 
    WHERE 
      novelId = ?`;

export const deleteUpdateFromDb = (novelId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      deleteUpdateFromDbQuery,
      [novelId],
      (txObj, res) => {},
      (txObj, error) => showToast(error.message),
    );
  });
};
const clearUpdatesQuery = `
	DELETE FROM updates;
	VACCUM;
	`;

export const clearUpdates = () =>
  db.transaction(tx =>
    tx.executeSql(
      clearUpdatesQuery,
      [],
      () => showToast('Updates cleared.'),
      (txObj, error) => showToast(error.message),
    ),
  );
