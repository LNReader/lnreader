import { xor } from 'lodash';

import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

import { txnErrorCallback } from '../utils/helpers';
import { LibraryNovelInfo } from '../types';

export const getCategoryNovelsFromDb = async (
  categoryId: number,
  onlyOngoingNovels?: boolean,
): Promise<LibraryNovelInfo[]> => {
  let query = `
  SELECT 
    * 
  FROM 
    novels 
  WHERE 
      categoryIds LIKE '[${categoryId}]' 
    OR 
      categoryIds LIKE '[${categoryId},%' 
    OR 
      categoryIds LIKE '%,${categoryId}]' 
    OR 
      categoryIds LIKE '%,${categoryId},%'
  `;

  if (onlyOngoingNovels) {
    query += ' AND status NOT LIKE "Completed"';
  }

  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        undefined,
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    });
  });
};

export const resetCategoryIdsToDefault = async (deletedCategoryId: number) => {
  const categoryNovels = await getCategoryNovelsFromDb(deletedCategoryId);

  db.transaction(tx => {
    categoryNovels.forEach(novel => {
      let categoryIds = xor(JSON.parse(novel.categoryIds), [deletedCategoryId]);

      categoryIds = categoryIds.length ? categoryIds : [1];

      tx.executeSql('UPDATE novels SET categoryIds = ? WHERE novelId = ?', [
        JSON.stringify(categoryIds),
        novel.novelId,
      ]);
    });
  });
};
