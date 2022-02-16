import * as SQLite from 'expo-sqlite';
import {showToast} from '../../hooks/showToast';

import {SourceChapterItem} from '../../sources/types';
import {ChapterItem} from '../types';
import {insertChapterUpdate} from './UpdateQueries';

const db = SQLite.openDatabase('lnreader.db');

const insertChaptersQuery = `
  INSERT OR IGNORE INTO
    chapters 
      (
        chapterUrl, 
        chapterName, 
        releaseDate, 
        novelId
      )
  VALUES
    (?, ?, ?, ?)

  `;

export const insertChapters = async (
  novelId: number,
  chapters: SourceChapterItem[],
) => {
  db.transaction(tx => {
    chapters.map(
      chapter =>
        tx.executeSql(
          insertChaptersQuery,
          [
            chapter.chapterUrl,
            chapter.chapterName,
            chapter.releaseDate,
            novelId,
          ],
          (txObj, res) => {},
          (txObj, error) => {},
        ),
      (txObj, res) => console.log('Chapters Insert / Id:', novelId),
      (txObj, error) => {},
    );
  });
};

const getChaptersQuery = `
  SELECT
    *
  FROM
    chapters
  WHERE
    novelId = ?
  
  `;

export const getChapters = (novelId: number): Promise<ChapterItem[]> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getChaptersQuery,
        [novelId],
        (txObj, {rows: {_array}}) => resolve(_array),
        (txObj, error) => reject(error),
      );
    }),
  );
};

const getDownloadedChaptersQuery = `
  SELECT
    *
  FROM
    chapters
  WHERE
    downloaded = 1
  `;

export const getDownloadedChapters = (): Promise<ChapterItem[]> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getDownloadedChaptersQuery,
        [],
        (txObj, {rows: {_array}}) => resolve(_array),
        (txObj, error) => reject(error),
      );
    }),
  );
};

const getPrevChapterQuery = `
  SELECT
    *
  FROM
    chapters
  WHERE
    novelId = ?
  AND
    chapterId < ?
  `;

export const getPrevChapter = (
  novelId: number,
  chapterId: number,
): Promise<ChapterItem> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getPrevChapterQuery,
        [novelId, chapterId],
        (txObj, results) => resolve(results.rows.item(results.rows.length - 1)),
        (txObj, error) => showToast(error.message),
      );
    }),
  );
};

const getNextChapterQuery = `
  SELECT
    *
  FROM
    chapters
  WHERE
    novelId = ?
  AND
  chapterId > ?
  `;

export const getNextChapter = (
  novelId: number,
  chapterId: number,
): Promise<ChapterItem> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getNextChapterQuery,
        [novelId, chapterId],
        (txObj, results) => resolve(results.rows.item(0)),
        (txObj, error) => showToast(error.message),
      );
    }),
  );
};

export const updateChapterDownloadedQuery = `
  UPDATE 
    chapters 
  SET 
    downloaded = 1
  WHERE 
    chapterId = ?`;

export const updateChapterDeletedQuery = `
  UPDATE 
    chapters 
  SET 
    downloaded = 0
  WHERE 
    chapterId = ?`;

const updateChapterBookmarkedQuery = `
  UPDATE 
    chapters 
  SET 
    bookmark = ? 
  WHERE
    chapterId = ?
  `;

export const updateChapterBookmarkedInDb = (
  isBookmarked: number,
  chapterId: number,
) => {
  db.transaction(tx => {
    tx.executeSql(
      updateChapterBookmarkedQuery,
      [isBookmarked, chapterId],
      (txObj, res) => {},
      (txObj, error) => showToast(error.message),
    );
  });
};

const updateChapterReadQuery = `
  UPDATE 
    chapters 
  SET 
    \`read\` = ? 
  WHERE
  chapterId = ?
  `;

export const updateChapterReadInDb = (isRead: number, chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      updateChapterReadQuery,
      [isRead, chapterId],
      (txObj, res) => {},
      (txObj, error) => showToast(error.message),
    );
  });
};

const updateChaptersQuery = `
  INSERT OR IGNORE INTO
    chapters 
      (
        chapterUrl, 
        chapterName, 
        releaseDate, 
        novelId
      )
  VALUES
    (?, ?, ?, ?)

  `;

export const updateChapters = async (
  novelId: number,
  chapters: SourceChapterItem[],
) => {
  db.transaction(tx => {
    chapters.map(
      chapter =>
        tx.executeSql(
          updateChaptersQuery,
          [
            chapter.chapterUrl,
            chapter.chapterName,
            chapter.releaseDate,
            novelId,
          ],
          (txObj, res) => insertChapterUpdate(res.insertId, novelId),
          (txObj, error) => {},
        ),
      (txObj, res) => console.log('Chapters Insert / Id:', novelId),
      (txObj, error) => {},
    );
  });
};
