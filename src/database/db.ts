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
import { showToast } from '@utils/showToast';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabaseSync(dbName);

export const createTables = () => {
  const isOnBoard = MMKVStorage.getBoolean('IS_ONBOARDED');

  if (!isOnBoard) {
    db.runSync('PRAGMA journal_mode = WAL');
    db.runSync('PRAGMA foreign_keys = ON');
    db.runSync('PRAGMA synchronous = NORMAL');
    db.runSync('PRAGMA cache_size = -8000');
    db.runSync('PRAGMA temp_store = MEMORY');
    db.runSync('PRAGMA auto_vacuum = INCREMENTAL');

    db.withTransactionSync(() => {
      db.runSync(createNovelTableQuery);
      db.runSync(createNovelIndexQuery);
      db.runSync(createCategoriesTableQuery);
      db.runSync(createCategoryDefaultQuery);
      db.runSync(createNovelCategoryTableQuery);
      db.runSync(createChapterTableQuery);
      db.runSync(createCategoryTriggerQuery);
      db.runSync(createChapterIndexQuery);
      db.runSync(createRepositoryTableQuery);
    });
  }
};

export const recreateDBIndex = () => {
  try {
    db.runSync('PRAGMA journal_mode = WAL');
    db.runSync('PRAGMA foreign_keys = ON');
    db.runSync('PRAGMA synchronous = NORMAL');
    db.runSync('PRAGMA cache_size = -8000');
    db.runSync('PRAGMA temp_store = MEMORY');
    db.runSync('PRAGMA auto_vacuum = INCREMENTAL');
    db.withTransactionSync(() => {
      db.runSync(dropNovelIndexQuery);
      db.runSync(dropChapterIndexQuery);
      db.runSync(createNovelIndexQuery);
      db.runSync(createChapterIndexQuery);
    });
  } catch (error: unknown) {
    if (__DEV__) console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    showToast(message);
  }
};
