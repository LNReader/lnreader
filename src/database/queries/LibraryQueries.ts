import { LibraryFilter } from '@screens/library/constants/constants';
import * as SQLite from 'expo-sqlite';
import { LibraryNovelInfo, NovelInfo } from '../types';
import { txnErrorCallback } from '../utils/helpers';

const db = SQLite.openDatabase('lnreader.db');

export const getLibraryNovelsFromDb = (
  onlyOngoingNovels?: boolean,
): Promise<NovelInfo[]> => {
  let getLibraryNovelsQuery = 'SELECT * FROM Novel WHERE in_library = 1';

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
  NIL.*, chaptersUnread, chaptersDownloaded
  FROM 
  (
    SELECT 
    Novel.id, Novel.url, name, cover,  
      Novel.plugin_id as pluginId, Novel.in_library as inLibrary, 
      category 
    FROM
    Novel JOIN (
      SELECT novel_id, name as category FROM (NovelCategory JOIN Category ON NovelCategory.category_id = Category.id)
    ) as NC ON Novel.id = NC.novel_id
    WHERE in_library = 1
    GROUP BY Novel.id
  ) as NIL 
  JOIN 
  (
    SELECT COUNT(unread) as chaptersUnread, COUNT(is_downloaded) as chaptersDownloaded, novel_id
      FROM
      Chapter
    GROUP BY novel_id
  ) as C
  ON NIL.id = C.novel_id 
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
    query += ` AND ${filter}`;
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
        undefined,
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};
