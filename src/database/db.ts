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
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { showToast } from '@utils/showToast';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabaseSync(dbName);

export const createTables = () => {
  const isOnBoard = MMKVStorage.getBoolean('IS_ONBOARDED');

  // These values are not persistent and need to be set on every app start
  db.execSync('PRAGMA busy_timeout = 5000');
  db.execSync('PRAGMA cache_size = 10000');
  db.execSync('PRAGMA foreign_keys = ON');

  const userVersion =
    db.getFirstSync<{ user_version: number }>('PRAGMA user_version')
      ?.user_version ?? 0;

  console.log('userVersion', userVersion);
  if (userVersion < 1) {
    console.log('updateToDBVersion1');

    updateToDBVersion1();
  }

  if (!isOnBoard) {
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
  }
};

export const recreateDBIndex = () => {
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
    if (__DEV__) console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    showToast(message);
  }
};

function updateToDBVersion1() {
  db.execSync('PRAGMA journal_mode = WAL');
  db.execSync('PRAGMA synchronous = NORMAL');
  db.execSync('PRAGMA temp_store = MEMORY');

  db.withTransactionSync(() => {
    try {
      db.runSync(
        'ALTER TABLE Novel ADD COLUMN chaptersDownloaded INTEGER DEFAULT 0',
      );

      db.runSync(
        'ALTER TABLE Novel ADD COLUMN chaptersUnread INTEGER DEFAULT 0',
      );
      db.runSync(
        'ALTER TABLE Novel ADD COLUMN totalChapters INTEGER DEFAULT 0',
      );
      db.runSync('ALTER TABLE Novel ADD COLUMN lastReadAt TEXT');
      db.runSync('ALTER TABLE Novel ADD COLUMN lastUpdatedAt TEXT');
      db.runSync(`UPDATE Novel
      SET chaptersDownloaded = (
          SELECT COUNT(*)
          FROM Chapter
          WHERE Chapter.novelId = Novel.id AND Chapter.isDownloaded = 1
      );
      `);
      db.runSync(`UPDATE Novel
SET chaptersUnread = (
    SELECT COUNT(*)
    FROM Chapter
    WHERE Chapter.novelId = Novel.id AND Chapter.unread = 1
);
`);
      db.runSync(`UPDATE Novel
SET totalChapters = (
    SELECT COUNT(*)
    FROM Chapter
    WHERE Chapter.novelId = Novel.id
);
`);
      db.runSync(`UPDATE Novel
      SET lastReadAt = (
          SELECT MAX(readTime)
          FROM Chapter
          WHERE Chapter.novelId = Novel.id
      );
      `);
      db.runSync(`UPDATE Novel
      SET lastUpdatedAt = (
          SELECT MAX(updatedTime)
          FROM Chapter
          WHERE Chapter.novelId = Novel.id
      );
      `);
      db.runSync(createNovelTriggerQueryInsert);
      db.runSync(createNovelTriggerQueryUpdate);
      db.runSync(createNovelTriggerQueryDelete);
      db.execSync('PRAGMA user_version = 1');
    } catch (error) {
      console.error(error);
    }
  });
}
