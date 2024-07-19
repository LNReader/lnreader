import {
  createCategoriesTableQuery,
  createCategoryDefaultQuery,
  createCategoryTriggerQuery,
} from './tables/CategoryTable';
import { createNovelTableQuery } from './tables/NovelTable';
import { createNovelCategoryTableQuery } from './tables/NovelCategoryTable';
import {
  createChapterTableQuery,
  createChapterNovelIdIndexQuery,
} from './tables/ChapterTable';
import { dbTxnErrorCallback } from './utils/helpers';
import { noop } from 'lodash-es';
import { createRepositoryTableQuery } from './tables/RepositoryTable';
import getDb from './openDB';

export const createTables = async () => {
  const db = await getDb();
  db.exec([{ sql: 'PRAGMA foreign_keys = ON', args: [] }], false, () => {});
  db.transaction(tx => {
    tx.executeSql(createNovelTableQuery);
    tx.executeSql(createCategoriesTableQuery);
    tx.executeSql(createCategoryDefaultQuery);
    tx.executeSql(createCategoryTriggerQuery);
    tx.executeSql(createNovelCategoryTableQuery);
    tx.executeSql(createChapterTableQuery);
    tx.executeSql(createChapterNovelIdIndexQuery);
  });

  db.transaction(tx => {
    tx.executeSql(createRepositoryTableQuery);
  });
};

/**
 * For Testing
 */
export async function deleteDatabase() {
  const db = await getDb();
  db.transaction(
    tx => {
      tx.executeSql('DROP TABLE Category');
      tx.executeSql('DROP TABLE Novel');
      tx.executeSql('DROP TABLE NovelCategory');
      tx.executeSql('DROP TABLE Chapter');
      tx.executeSql('DROP TABLE Download');
      tx.executeSql('DROP TABLE Repository');
    },
    dbTxnErrorCallback,
    noop,
  );
}
