import * as SQLite from 'expo-sqlite';

import {SourceNovel} from '../../sources/types';
import {NovelInfo} from '../types';

const db = SQLite.openDatabase('lnreader.db');

const insertNovelQuery = `
  INSERT INTO
    novels(
      sourceUrl,
      novelUrl,
      sourceId,
      source,
      novelName,
      novelCover,
      novelSummary,
      author,
      status,
      genre
    )
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

export const insertNovel = (novel: SourceNovel): Promise<number> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx =>
      tx.executeSql(
        insertNovelQuery,
        [
          novel.url,
          novel.novelUrl,
          novel.sourceId,
          novel.sourceName,
          novel.novelName,
          novel.novelCover,
          novel.summary,
          novel.author,
          novel.status,
          novel.genre,
        ],
        (txObj, results) => resolve(results.insertId),
        (txObj, error) => console.log(error),
      ),
    ),
  );
};

const getNovelFromDbQuery = `
  SELECT
    *
  FROM
    novels
  WHERE
    novelUrl = ?
  AND 
    sourceId = ?
  `;

export const getNovelFromDb = (
  sourceId: number,
  novelUrl: string,
): Promise<NovelInfo> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getNovelFromDbQuery,
        [novelUrl, sourceId],
        (txObj, results) => resolve(results.rows.item(0)),
        (txObj, error) => reject(error),
      );
    }),
  );
};

const getAllNovelsFromDbQuery = `
  SELECT
    *
  FROM
    novels
  `;

export const getAllNovelsFromDb = () => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getAllNovelsFromDbQuery,
        null,
        (txObj, results) => resolve(results.rows._array),
        (txObj, error) => console.log(error.message),
      );
    }),
  );
};

const toggleFollowNovelInDbQuery = `
  UPDATE
    novels
  SET
    followed = ?
  WHERE
    novelId = ?
  `;

export const toggleFollowNovelInDb = (id: number, followed: number) => {
  db.transaction(tx => {
    tx.executeSql(
      toggleFollowNovelInDbQuery,
      [!followed, id],
      (txObj, results) => {},
      (txObj, error) => {},
    );
  });
};

export const updateNovelReadQuery = `
  UPDATE 
    novels 
  SET 
    unread = 0 
  WHERE
    novelId = ?
  `;

const updateNovelInfoQuery = `
  UPDATE
    novels(
      novelName,
      novelCover,
      novelSummary,
      author,
      status,
      genre
    )
  VALUES
    (?, ?, ?, ?, ?, ?)
  `;

export const updateNovelInfo = (novel: SourceNovel): Promise<number> => {
  return new Promise((resolve, reject) =>
    db.transaction(tx =>
      tx.executeSql(
        updateNovelInfoQuery,
        [
          novel.novelName,
          novel.novelCover,
          novel.summary,
          novel.author,
          novel.status,
          novel.genre,
        ],
        (txObj, results) => resolve(results.insertId),
        (txObj, error) => console.log(error.message),
      ),
    ),
  );
};
