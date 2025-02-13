import * as SQLite from 'expo-sqlite';
import {
  createCategoriesTableQuery,
  createCategoryDefaultQuery,
  createCategoryTriggerQuery,
} from './tables/CategoryTable';
import {
  createNovelIndexQuery,
  createNovelTableQuery,
  dropNovelIndexQuery,
} from './tables/NovelTable';
import { createNovelCategoryTableQuery } from './tables/NovelCategoryTable';
import {
  createChapterTableQuery,
  createChapterIndexQuery,
  dropChapterIndexQuery,
} from './tables/ChapterTable';

import { createRepositoryTableQuery } from './tables/RepositoryTable';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { runSync } from './utils/helpers';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabaseSync(dbName);

export const createTables = () => {
  const isOnBoard = MMKVStorage.getBoolean('IS_ONBOARDED');
  if (!isOnBoard) {
    db.execSync('PRAGMA foreign_keys = ON');
    db.execSync('PRAGMA journal_mode = WAL');

    db.withTransactionSync(() => {
      db.execSync(createNovelTableQuery);
      db.execSync(createNovelIndexQuery);
      db.execSync(createCategoriesTableQuery);
      db.execSync(createCategoryDefaultQuery);
      db.execSync(createNovelCategoryTableQuery);
      db.execSync(createChapterTableQuery);
      db.execSync(createCategoryTriggerQuery);
      db.execSync(createChapterIndexQuery);
      db.execSync(createRepositoryTableQuery);
    });
  }
};

export const recreateDBIndex = () => {
  const isOnBoard = MMKVStorage.getBoolean('IS_ONBOARDED');
  if (!isOnBoard) {
    runSync([
      [dropNovelIndexQuery],
      [dropChapterIndexQuery],
      [createNovelIndexQuery],
      [createChapterIndexQuery],
    ]);
  }
};
