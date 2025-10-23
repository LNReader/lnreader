import * as SQLite from 'expo-sqlite';
import {
  createCategoriesTableQuery,
  createCategoryDefaultQuery,
  createCategoryTriggerQuery,
} from './tables/CategoryTable';
import {
  createNovelIndexQuery,
  createNovelTableQuery,
  createNovelTriggerQueryDelete,
  createNovelTriggerQueryInsert,
  createNovelTriggerQueryUpdate,
  dropNovelIndexQuery,
} from './tables/NovelTable';
import { createNovelCategoryTableQuery } from './tables/NovelCategoryTable';
import {
  createChapterTableQuery,
  createChapterIndexQuery,
  dropChapterIndexQuery,
} from './tables/ChapterTable';

import { createRepositoryTableQuery } from './tables/RepositoryTable';
import { getErrorMessage } from '@utils/error';
import { showToast } from '@utils/showToast';
import { MigrationRunner } from './utils/migrationRunner';
import { migrations } from './migrations';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabaseSync(dbName);

/**
 * Creates the initial database schema for fresh installations
 * Sets up all tables, indexes, triggers and sets version to 1
 */
const createInitialSchema = () => {
  db.execSync('PRAGMA journal_mode = WAL');
  db.execSync('PRAGMA synchronous = NORMAL');
  db.execSync('PRAGMA temp_store = MEMORY');

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
    db.runSync(createNovelTriggerQueryInsert);
    db.runSync(createNovelTriggerQueryUpdate);
    db.runSync(createNovelTriggerQueryDelete);

    db.execSync('PRAGMA user_version = 1');
  });
};

/**
 * Initializes the database with optimal settings and runs any pending migrations
 * Handles both fresh installations and existing databases
 */
export const initializeDatabase = () => {
  db.execSync('PRAGMA busy_timeout = 5000');
  db.execSync('PRAGMA cache_size = 10000');
  db.execSync('PRAGMA foreign_keys = ON');

  const userVersion =
    db.getFirstSync<{ user_version: number }>('PRAGMA user_version')
      ?.user_version ?? 0;

  if (userVersion === 0) {
    createInitialSchema();
  }

  const migrationRunner = new MigrationRunner(migrations, {
    verbose: __DEV__,
  });

  migrationRunner.runMigrations(db);
};

export const recreateDatabaseIndexes = () => {
  try {
    db.execSync('PRAGMA analysis_limit=4000');
    db.execSync('PRAGMA optimize');

    db.execSync('PRAGMA journal_mode = WAL');
    db.execSync('PRAGMA foreign_keys = ON');
    db.execSync('PRAGMA synchronous = NORMAL');
    db.execSync('PRAGMA cache_size = 10000');
    db.execSync('PRAGMA temp_store = MEMORY');
    db.execSync('PRAGMA busy_timeout = 5000');

    db.withTransactionSync(() => {
      db.runSync(dropNovelIndexQuery);
      db.runSync(dropChapterIndexQuery);
      db.runSync(createNovelIndexQuery);
      db.runSync(createChapterIndexQuery);
    });
  } catch (error: unknown) {
    showToast(getErrorMessage(error));
  }
};
