import * as SQLite from 'expo-sqlite';
import {showToast} from '../../hooks/showToast';

import {LibraryNovelInfo} from '../types';

const db = SQLite.openDatabase('lnreader.db');

const getLibraryNovelsFromDbQuery = `
  SELECT 
    novels.*, C.chaptersUnread, D.chaptersDownloaded
  FROM 
    novels
  LEFT JOIN (
      SELECT 
        chapters.novelId, COUNT(*) AS chaptersUnread 
      FROM 
        chapters
      WHERE
        chapters.read = 0
      GROUP BY 
        chapters.novelId
  ) AS C
  ON 
  novels.novelId = C.novelId
  LEFT JOIN (
      SELECT 
        chapters.novelId, COUNT(*) AS chaptersDownloaded 
      FROM 
        chapters
      WHERE 
        chapters.downloaded = 1
      GROUP BY 
        chapters.novelId
  ) AS D
  ON 
    novels.novelId = D.novelId
  WHERE 
    novels.followed = 1
  `;

export const getLibraryNovelsFromDb = (
  filters: string[],
  sort: string,
  searchText?: string,
): Promise<LibraryNovelInfo[]> => {
  let query = getLibraryNovelsFromDbQuery;

  if (filters.length > 0) {
    query = query.concat(' AND ', filters.join(' AND '));
  }

  if (searchText) {
    query = query.concat(" AND novels.name LIKE '%", searchText, "%'");
  }

  if (sort) {
    query = query.concat(' ORDER BY ', sort);
  }

  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (txObj, {rows: {_array}}) => resolve(_array),
        (txObj, error) => {
          reject(error);
          return true;
        },
      );
    }),
  );
};
