/* eslint-disable @typescript-eslint/no-unused-vars */

import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
import { showToast } from '@hooks/showToast';
import { getPlugin } from '@plugins/pluginManager';
import { DownloadedChapter } from '../types';

import {
  updateChapterDeletedQuery,
  updateChapterDownloadedQuery,
} from './ChapterQueries';

const db = SQLite.openDatabase('lnreader.db');

const downloadChapterQuery = `
  INSERT INTO 
      Download (chapterId, chapterText)
  VALUES
    (?, ?)
	`;

export const fetchAndInsertChapterInDb = async (
  pluginId: string,
  novelUrl: string,
  chapterId: number,
  chapterUrl: string,
) => {
  const chapter = await getPlugin(pluginId).parseChapter(novelUrl, chapterUrl);

  db.transaction(tx => {
    tx.executeSql(updateChapterDownloadedQuery, [chapterId]);
    tx.executeSql(
      downloadChapterQuery,
      [chapterId, chapter.chapterText],
      (txObj, res) => {},
      txnErrorCallback,
    );
  });
};

const deleteChapterFromDbQuery = `
  DELETE FROM 
    Download
  WHERE
    chapterId = ?
	`;

export const deleteChapterFromDb = (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(updateChapterDeletedQuery, [chapterId]);
    tx.executeSql(
      deleteChapterFromDbQuery,
      [chapterId],
      (txObj, res) => {},
      txnErrorCallback,
    );
  });
};

const getChapterFromDbQuery = `
  SELECT 
    * 
  FROM 
    Download 
  WHERE 
    chapterId = ?
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
        (_, error) => {
          reject(error);
          return false;
        },
      );
    }),
  );
};

const deleteReadChaptersFromDbQuery = `
DELETE FROM 
  Download 
WHERE 
  Download.chapterId IN (
    SELECT 
      chapters.chapterId 
    FROM 
      Download 
      INNER JOIN Chapter ON Chapter.chapterId = Download.DownloadId 
    WHERE 
      Chapter.unread = 0
  );
`;

let updateChaptersDeletedQuery = `
UPDATE 
  Chapter 
SET 
  isDownloaded = 0 
WHERE 
  Chapter.id IN (
    SELECT 
      Download.chapterId 
    FROM 
      Download 
      INNER JOIN Chapter ON Chapter.id = Download.chapterId 
    WHERE 
      Chapter.unread = 0
  );
`;

export const deleteReadChaptersFromDb = (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      updateChaptersDeletedQuery,
      [],
      (txObj, res) => {},
      txnErrorCallback,
    );
    tx.executeSql(
      deleteReadChaptersFromDbQuery,
      [],
      (txObj, res) => showToast('Deleted read chapters.'),
      txnErrorCallback,
    );
  });
};
