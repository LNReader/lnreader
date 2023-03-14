import { LibraryFilter } from '@screens/library/constants/constants';
import * as SQLite from 'expo-sqlite';
import { LibraryNovelInfo, NovelInfo } from '../types';
import { txnErrorCallback } from '../utils/helpers';

const db = SQLite.openDatabase('lnreader.db');

export const getNovelsWithCatogory = (
  categoryId: number,
  onlyOngoingNovels?: boolean,
): Promise<NovelInfo[]> => {
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

export const getLibraryNovelsFromDb = (
  onlyOngoingNovels?: boolean,
): Promise<NovelInfo[]> => {
  let getLibraryNovelsQuery = 'SELECT * FROM Novel WHERE inLibrary = 1';

  if (onlyOngoingNovels) {
    getLibraryNovelsQuery += " AND status NOT LIKE 'Completed'";
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getLibraryNovelsQuery,
        undefined,
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

const getLibraryWithCategoryQuery = `
  SELECT 
  NIL.*, chaptersUnread, chaptersDownloaded, lastReadAt, lastUpdatedAt
  FROM 
  (
    SELECT 
      Novel.*,
      category 
    FROM
    Novel LEFT JOIN (
      SELECT NovelId, name as category FROM (NovelCategory JOIN Category ON NovelCategory.categoryId = Category.id)
    ) as NC ON Novel.id = NC.novelId
    WHERE inLibrary = 1
  ) as NIL 
  JOIN 
  (
    SELECT SUM(unread) as chaptersUnread, SUM(isDownloaded) as chaptersDownloaded, id as ChapterId, novelId
    FROM Chapter
    GROUP BY novelId
  ) as C ON NIL.id = C.novelId
  LEFT JOIN
  (
    SELECT MAX(readTime) as lastReadAt, MAX(updateTime) as lastUpdatedAt, novelId
      FROM
      Chapter
      JOIN History
      ON History.chapterId = Chapter.id
      JOIN Download
      ON Download.chapterId = Chapter.id
    GROUP BY novelId
  ) as Time
  ON NIL.id = Time.novelId 
`;

export const getLibraryWithCategory = ({
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
  let query = getLibraryWithCategoryQuery;
  if (filter) {
    query += ` AND ${filter} `;
  }

  if (downloadedOnlyMode) {
    query += ' ' + LibraryFilter.DownloadedOnly;
  }

  if (searchText) {
    query += ` AND name LIKE '%${searchText}%'`;
  }
  if (sortOrder) {
    query += `ORDER BY ${sortOrder}`;
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};
