import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash';
import { Category } from '../types';
import { txnErrorCallback } from '../utils/helpers';
const db = SQLite.openDatabase('lnreader.db');

const getCategoriesQuery = `
  SELECT * FROM categories
	`;

export const getCategoriesFromDb = (): Promise<Category[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getCategoriesQuery,
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
