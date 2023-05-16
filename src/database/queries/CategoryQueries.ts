import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash-es';
import { Category, ExtendedCategory } from '../types';
import { showToast } from '@hooks/showToast';
import { txnErrorCallback } from '../utils/helpers';
import { getExtendedNovelsWithCategory } from './LibraryQueries';
const db = SQLite.openDatabase('lnreader.db');

export const getAllCategories = (): Promise<Category[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Category ORDER BY sort',
        [],
        (txObj, { rows }) => resolve(rows._array),
        txnErrorCallback,
      );
    });
  });
};

export const getExtendCategories = async ({
  filter,
  searchText,
  sortOrder,
  downloadedOnlyMode,
}: {
  sortOrder?: string;
  filter?: string;
  searchText?: string;
  downloadedOnlyMode?: boolean;
}) => {
  const allCategories = await getAllCategories();
  return await Promise.all(
    allCategories.map(async category => {
      const novels = await getExtendedNovelsWithCategory(
        {
          sortOrder,
          filter,
          searchText,
          downloadedOnlyMode,
        },
        category,
      );
      return { ...category, novels: novels } as ExtendedCategory;
    }),
  );
};

export const insertCategory = (name: string) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Category (name) VALUES (?)',
      [name],
      noop,
      txnErrorCallback,
    );
  });
};

export const updateCategory = (category: Category) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Category set name = ?, sort = ? WHERE id = ?',
      [category.name, category.sort, category.id],
      noop,
      txnErrorCallback,
    );
  });
};

export const updateCategoriesOrder = (categories: Category[]) => {
  db.transaction(() => {
    categories.forEach(async category => {
      await updateCategory(category);
    });
  });
};

export const deleteCategory = (category: Category) => {
  if (category.sort === 1) {
    return showToast('You cant delete default category');
  }
  // set category of novels which have only this category to default
  const beforeDeleteCategoryQuery = `
        UPDATE NovelCategory SET categoryId = (SELECT id FROM Category WHERE sort = 1)
        WHERE novelId IN (
            SELECT novelId FROM NovelCategory as NC
            GROUP BY novelId
            HAVING COUNT(NC.categoryId) = 1
        )
        AND categoryId = ?;
    `;
  const deleteCategoryQuery = 'DELETE FROM Category WHERE id = ?';
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

export const isCategoryNameDuplicate = (name: string): Promise<boolean> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as isDuplicated FROM Category WHERE name = ?',
        [name],
        (txObj, { rows }) => resolve(rows.item(0).isDuplicated),
        txnErrorCallback,
      );
    }),
  );
};
