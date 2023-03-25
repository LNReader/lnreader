import * as SQLite from 'expo-sqlite';
import { countBy } from 'lodash-es';
import { LibraryStats } from '../types';
import { txnErrorCallback } from '../utils/helpers';

const db = SQLite.openDatabase('lnreader.db');

const getLibraryStatsQuery = `
  SELECT COUNT(*) as novelsCount, COUNT(DISTINCT sourceId) as sourcesCount
  FROM novels
  WHERE novels.followed = 1
  `;

const getChaptersReadCountQuery = `
  SELECT COUNT(*) as chaptersRead
  FROM chapters
  JOIN novels
  ON chapters.novelId = novels.novelId
  WHERE chapters.read = 1 AND novels.followed = 1
  `;

const getChaptersTotalCountQuery = `
  SELECT COUNT(*) as chaptersCount
  FROM chapters
  JOIN novels
  ON chapters.novelId = novels.novelId
  WHERE novels.followed = 1
  `;

const getChaptersUnreadCountQuery = `
  SELECT COUNT(*) as chaptersUnread
  FROM chapters
  JOIN novels
  ON chapters.novelId = novels.novelId
  WHERE chapters.read = 0 AND novels.followed = 1
  `;

const getChaptersDownloadedCountQuery = `
  SELECT COUNT(*) as chaptersDownloaded
  FROM chapters
  JOIN novels
  ON chapters.novelId = novels.novelId
  WHERE chapters.downloaded = 1 AND novels.followed = 1
  `;

const getNovelGenresQuery = `
  SELECT genre
  FROM novels
  WHERE novels.followed = 1
  `;

const getNovelStatusQuery = `
  SELECT status
  FROM novels
  WHERE novels.followed = 1
  `;

export const getLibraryStatsFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getLibraryStatsQuery,
        undefined,
        (txObj, { rows: { _array } }) => {
          resolve(_array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersTotalCountFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getChaptersTotalCountQuery,
        undefined,
        (txObj, { rows: { _array } }) => {
          resolve(_array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersReadCountFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getChaptersReadCountQuery,
        undefined,
        (txObj, { rows: { _array } }) => {
          resolve(_array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersUnreadCountFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getChaptersUnreadCountQuery,
        undefined,
        (txObj, { rows: { _array } }) => {
          resolve(_array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersDownloadedCountFromDb =
  async (): Promise<LibraryStats> => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          getChaptersDownloadedCountQuery,
          undefined,
          (txObj, { rows: { _array } }) => {
            resolve(_array[0]);
          },
          txnErrorCallback,
        );
      });
    });
  };

export const getNovelGenresFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getNovelGenresQuery,
        undefined,
        (txObj, { rows: { _array } }) => {
          let genres: string[] = [];

          _array.forEach((item: { genre: string }) => {
            const novelGenres = item.genre?.split(/\s*,\s*/);

            if (novelGenres?.length) {
              genres.push(...novelGenres);
            }
          });

          resolve({ genres: countBy(genres) });
        },
        txnErrorCallback,
      );
    });
  });
};

export const getNovelStatusFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getNovelStatusQuery,
        undefined,
        (txObj, { rows: { _array } }) => {
          let status: string[] = [];

          _array.forEach((item: { status: string }) => {
            status.push(item.status);
          });

          resolve({ status: countBy(status) });
        },
        txnErrorCallback,
      );
    });
  });
};
