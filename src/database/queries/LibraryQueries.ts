import { LibraryFilter } from '@screens/library/constants/constants';
import * as SQLite from 'expo-sqlite';
import { LibraryNovelInfo, NovelInfo } from '../types';
import { txnErrorCallback } from '../utils/helpers';

const db = SQLite.openDatabase('lnreader.db');

const getLibraryQuery = `
    SELECT novels.*, C.chaptersUnread, D.chaptersDownloaded, H.lastReadAt
    FROM novels
    LEFT JOIN (
        SELECT chapters.novelId, COUNT(*) AS chaptersUnread 
        FROM chapters
        WHERE chapters.read = 0
        GROUP BY chapters.novelId
    ) AS C
    ON novels.novelId = C.novelId
    LEFT JOIN (
        SELECT chapters.novelId, COUNT(*) AS chaptersDownloaded 
        FROM chapters
        WHERE chapters.downloaded = 1
        GROUP BY chapters.novelId
    ) AS D
    ON novels.novelId = D.novelId
    LEFT JOIN (
        SELECT history.historyNovelId as novelId, historyTimeRead AS lastReadAt
        FROM history
        GROUP BY history.historyNovelId
        HAVING history.historyTimeRead = MAX(history.historyTimeRead)
        ORDER BY history.historyTimeRead DESC
    ) AS H
    ON novels.novelId = H.novelId
    WHERE novels.followed = 1
    `;

export const getLibrary = ({
  filter,
  searchText,
  sortOrder,
  downloadedOnlyMode,
}: {
  sortOrder?: string;
  filter?: string;
  searchText?: string;
  downloadedOnlyMode?: boolean;
}): Promise<LibraryNovelInfo[]> => {
  let query = getLibraryQuery;

  if (filter) {
    query += ` AND ${filter}`;
  }

  if (downloadedOnlyMode) {
    query += ' ' + LibraryFilter.DownloadedOnly;
  }

  if (searchText) {
    query += ` AND novelName LIKE '%${searchText}%'`;
  }

  if (sortOrder) {
    query += ` ORDER BY ${sortOrder}`;
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        query,
        undefined,
        (txObj, { rows: { _array } }) => resolve(_array),
        txnErrorCallback,
      );
    }),
  );
};

const getLibraryNovelsQuery = 'SELECT * FROM novels WHERE followed = 1';

export const getLibraryNovelsFromDb = (): Promise<NovelInfo[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getLibraryNovelsQuery,
        undefined,
        (txObj, { rows: { _array } }) => resolve(_array),
        txnErrorCallback,
      );
    }),
  );
};
