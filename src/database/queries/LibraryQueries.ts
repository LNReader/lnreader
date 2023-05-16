import { LibraryFilter } from '@screens/library/constants/constants';
import * as SQLite from 'expo-sqlite';
import { Category, ExtendedNovel, Novel } from '../types';
import { txnErrorCallback } from '../utils/helpers';

const db = SQLite.openDatabase('lnreader.db');

export const getNovelsWithCategory = (
  categoryId: number,
  onlyOngoingNovels?: boolean,
): Promise<Novel[]> => {
  let query = `
    SELECT
    * 
    FROM Novel
    JOIN (
        SELECT novelId 
            FROM NovelCategory WHERE categoryId = ?
      ) as NC
    ON Novel.id = NC.novelId
  `;
  if (onlyOngoingNovels) {
    query += " AND status NOT LIKE 'Completed'";
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        query,
        [categoryId],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const getNovelsInLibrary = (
  onlyOngoingNovels?: boolean,
): Promise<Novel[]> => {
  let getLibraryNovelsQuery = 'SELECT * FROM Novel WHERE inLibrary = 1';

  if (onlyOngoingNovels) {
    getLibraryNovelsQuery += " AND status NOT LIKE 'Completed'";
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getLibraryNovelsQuery,
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const getExtendedNovelsWithCategory = (
  {
    filter,
    searchText,
    sortOrder,
    downloadedOnlyMode,
  }: {
    sortOrder?: string;
    filter?: string;
    searchText?: string;
    downloadedOnlyMode?: boolean;
  },
  catgory: Category,
): Promise<ExtendedNovel[]> => {
  let query = `
    SELECT 
      N.*, chaptersUnread, chaptersDownloaded, lastReadAt, lastUpdatedAt
    FROM Novel as N
    JOIN 
    (
      SELECT 
        SUM(unread) as chaptersUnread, SUM(isDownloaded) as chaptersDownloaded, 
        novelId, MAX(readTime) as lastReadAt, MAX(updatedTime) as lastUpdatedAt
      FROM Chapter
      GROUP BY novelId
    ) as C ON N.id = C.novelId
    AND N.id IN
    (
      SELECT novelId FROM Category as CA JOIN NovelCategory as NC  
      ON CA.id = NC.categoryId AND CA.id = ?
    )
  `;

  if (filter) {
    query += ` AND ${filter} `;
  }
  if (downloadedOnlyMode) {
    query += ' ' + LibraryFilter.DownloadedOnly;
  }

  if (searchText) {
    query += ` AND name LIKE '%${searchText}%' `;
  }

  if (sortOrder) {
    query += ` ORDER BY ${sortOrder} `;
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        query,
        [catgory.id],
        (txObj, { rows }) => resolve(rows._array),
        txnErrorCallback,
      );
    }),
  );
};
