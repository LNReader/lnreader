import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash';
import { Category } from '../types';
import { txnErrorCallback } from '../utils/helpers';
const db = SQLite.openDatabase('lnreader.db');

interface GetCategoryOptions {
  getDefaultCategory?: boolean;
}

const getCategoriesQuery = `
  SELECT * FROM categories
	`;

export const getCategoriesFromDb = (
  options?: GetCategoryOptions,
): Promise<Category[]> => {
  let query = getCategoriesQuery;

  if (options?.getDefaultCategory === false) {
    query += 'WHERE id > 1 ORDER BY sort NULLS LAST';
  } else {
    query += ' ORDER BY CASE WHEN id > 1 THEN 1 ELSE 0 END, sort NULLS LAST';
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

const createCategoryQuery = `
  INSERT INTO categories (name) 
  VALUES 
    (?)
	`;

export const createCategory = (categoryName: string): void =>
  db.transaction(tx =>
    tx.executeSql(createCategoryQuery, [categoryName], noop, txnErrorCallback),
  );

const deleteCategoryQuery = `
  DELETE FROM categories 
  WHERE 
    id = ?
	`;

export const deleteCategoryById = (categoryId: number): void =>
  db.transaction(tx =>
    tx.executeSql(deleteCategoryQuery, [categoryId], noop, txnErrorCallback),
  );

const updateCategoryQuery = `
  UPDATE categories SET name = ? WHERE id = ?
	`;

export const updateCategory = (
  categoryId: number,
  categoryName: string,
): void =>
  db.transaction(tx =>
    tx.executeSql(
      updateCategoryQuery,
      [categoryName, categoryId],
      noop,
      txnErrorCallback,
    ),
  );

const isCategoryNameDuplicateQuery = `
  SELECT COUNT(*) as isDuplicate FROM categories WHERE name = ?
	`;

export const isCategoryNameDuplicate = (
  categoryName: string,
): Promise<boolean> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        isCategoryNameDuplicateQuery,
        [categoryName],
        (txObj, { rows: { _array } }) =>
          resolve(Boolean(_array[0]?.isDuplicate)),
        txnErrorCallback,
      );
    }),
  );
};

const updateCategoryOrderQuery = `
  UPDATE categories SET sort = ? WHERE id = ?
	`;

export const updateCategoryOrderInDb = (categories: Category[]): void =>
  db.transaction(tx => {
    categories.map(category => {
      tx.executeSql(
        updateCategoryOrderQuery,
        [category.sort, category.id],
        noop,
        txnErrorCallback,
      );
    });
  });
