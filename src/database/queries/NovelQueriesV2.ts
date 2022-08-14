import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

import { txnErrorCallback } from '../utils/helpers';

export const getCategoryNovelsFromDb = async (
  categoryId: number,
  onlyOngoingNovels?: boolean,
) => {
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
