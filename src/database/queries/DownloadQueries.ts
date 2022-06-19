/* eslint-disable @typescript-eslint/no-unused-vars */

import * as SQLite from 'expo-sqlite';
import { showToast } from '../../hooks/showToast';
import { sourceManager } from '../../sources/sourceManager';
import { DownloadedChapter } from '../types';

import {
  updateChapterDeletedQuery,
  updateChapterDownloadedQuery,
} from './ChapterQueries';

const db = SQLite.openDatabase('lnreader.db');

const downloadChapterQuery = `
  INSERT INTO 
      downloads (downloadChapterId, chapterName, chapterText)
  VALUES
    (?, ?, ?)
	`;

export const fetchAndInsertChapterInDb = async (
  sourceId: number,
  novelUrl: string,
  chapterId: number,
  chapterUrl: string,
) => {
  const chapter = await sourceManager(sourceId).parseChapter(
    novelUrl,
    chapterUrl,
  );

  db.transaction(tx => {
    tx.executeSql(updateChapterDownloadedQuery, [chapterId]);
    tx.executeSql(
      downloadChapterQuery,
      [chapterId, chapter.chapterName, chapter.chapterText],
      (txObj, res) => {},
      (_txObj, error) => showToast(error),
    );
  });
};

const deleteChapterFromDbQuery = `
  DELETE FROM 
    downloads
  WHERE
    downloadChapterId = ?
	`;

export const deleteChapterFromDb = (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(updateChapterDeletedQuery, [chapterId]);
    tx.executeSql(
      deleteChapterFromDbQuery,
      [chapterId],
      (txObj, res) => {},
      (_txObj, error) => showToast(error.message),
    );
  });
};

const getChapterFromDbQuery = `
  SELECT 
    * 
  FROM 
    downloads 
  WHERE 
    downloadChapterId = ?
  `;

export const getChapterFromDb = async (
  chapterId: number,
): Promise<DownloadedChapter> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getChapterFromDbQuery,
        [chapterId],
        (txObj, results) => resolve(results.rows.item(0)),
        (txObj, error) => reject(error),
      );
    }),
  );
};

const deleteReadChaptersFromDbQuery = `
DELETE FROM 
  downloads 
WHERE 
  downloads.downloadChapterId IN (
    SELECT 
      chapters.chapterId 
    FROM 
      downloads 
      INNER JOIN chapters ON chapters.chapterId = downloads.downloadChapterId 
    WHERE 
      chapters.read = 1
  );
`;

let updateChaptersDeletedQuery = `
UPDATE 
  chapters 
SET 
  downloaded = 0 
WHERE 
  chapters.chapterId IN (
    SELECT 
      downloads.downloadChapterId 
    FROM 
      downloads 
      INNER JOIN chapters ON chapters.chapterId = downloads.downloadChapterId 
    WHERE 
      chapters.read = 1
  );
`;

export const deleteReadChaptersFromDb = (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      updateChaptersDeletedQuery,
      [],
      (txObj, res) => {},
      (txObj, error) => showToast(error.message),
    );
    tx.executeSql(
      deleteReadChaptersFromDbQuery,
      [],
      (txObj, res) => showToast('Deleted read chapters.'),
      (txObj, error) => showToast(error.message),
    );
  });
};
