import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash-es';
import { BackupCategory, Category, NovelCategory } from '../types';
import { showToast } from '@utils/showToast';
import { txnErrorCallback } from '../utils/helpers';
const db = SQLite.openDatabase('lnreader.db');

const getCategoriesQuery = `
  SELECT * FROM Category ORDER BY sort
	`;

export const getCategoriesFromDb = async (): Promise<Category[]> => {
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

const createCategoryQuery = 'INSERT INTO Category (name) VALUES (?)';

export const createCategory = (categoryName: string): void =>
  db.transaction(tx =>
    tx.executeSql(createCategoryQuery, [categoryName], noop, txnErrorCallback),
  );

const beforeDeleteCategoryQuery = `
    UPDATE NovelCategory SET categoryId = (SELECT id FROM Category WHERE sort = 1)
    WHERE novelId IN (
      SELECT novelId FROM NovelCategory
      GROUP BY novelId
      HAVING COUNT(categoryId) = 1
    )
    AND categoryId = ?;
`;
const deleteCategoryQuery = 'DELETE FROM Category WHERE id = ?';

export const deleteCategoryById = (category: Category): void => {
  if (category.sort <= 2) {
    return showToast('You cant delete default category');
  }
  db.transaction(tx => {
    tx.executeSql(
      beforeDeleteCategoryQuery,
      [category.id],
      noop,
      txnErrorCallback,
    );
    tx.executeSql(deleteCategoryQuery, [category.id], noop, txnErrorCallback);
  });
};

const updateCategoryQuery = 'UPDATE Category SET name = ? WHERE id = ?';

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
  SELECT COUNT(*) as isDuplicate FROM Category WHERE name = ?
	`;

export const isCategoryNameDuplicate = (
  categoryName: string,
): Promise<boolean> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        isCategoryNameDuplicateQuery,
        [categoryName],
        (txObj, { rows }) => {
          const { _array } = rows as any;
          resolve(Boolean(_array[0]?.isDuplicate));
        },
        txnErrorCallback,
      );
    }),
  );
};

const updateCategoryOrderQuery = 'UPDATE Category SET sort = ? WHERE id = ?';

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

export const getAllNovelCategories = (): Promise<NovelCategory[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM NovelCategory',
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const _restoreCategory = (category: BackupCategory) => {
  db.transaction(tx => {
    tx.executeSql('DELETE FROM Category WHERE id = ?', [category.id]);
    tx.executeSql('INSERT INTO Category (id, name, sort) VALUES (?, ?, ?)', [
      category.id,
      category.name,
      category.sort,
    ]);
    for (const novelId of category.novelIds) {
      tx.executeSql(
        'INSERT INTO NovelCategory (categoryId, novelId) VALUES (?, ?)',
        [category.id, novelId],
      );
    }
  });
};
