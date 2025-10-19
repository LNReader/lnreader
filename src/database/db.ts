import * as SQLite from 'expo-sqlite';
import {
  createCategoriesTableQuery,
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
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import NativeFile from '@specs/NativeFile';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabaseSync(dbName);

function columnExists(table: string, column: string): boolean {
  try {
    const rows = db.getAllSync<{ name: string }>(`PRAGMA table_info(${table})`);
    return rows.some(r => r.name === column);
  } catch {
    return false;
  }
}

export const createTables = () => {
  // These values are not persistent and need to be set on every app start
  db.execSync('PRAGMA busy_timeout = 5000');
  db.execSync('PRAGMA cache_size = 10000');
  db.execSync('PRAGMA foreign_keys = ON');
  db.execSync('PRAGMA journal_mode = WAL');
  db.execSync('PRAGMA synchronous = NORMAL');
  db.execSync('PRAGMA temp_store = MEMORY');

  let userVersion =
    db.getFirstSync<{ user_version: number }>('PRAGMA user_version')
      ?.user_version ?? 0;

  if (userVersion === 0) {
    db.withTransactionSync(() => {
      db.runSync(createNovelTableQuery);
      db.runSync(createNovelIndexQuery);
      db.runSync(createChapterTableQuery);
      db.runSync(createChapterIndexQuery);
      db.runSync(createCategoriesTableQuery);
      try {
        db.runSync(
          'INSERT OR IGNORE INTO Category (id,name,sort) VALUES (1, ?, 1)',
          [
            ((getString as any)
              ? (getString as any)('categories.default')
              : 'Default') as any,
          ],
        );
        db.runSync(
          'INSERT OR IGNORE INTO Category (id,name,sort) VALUES (2, ?, 2)',
          [
            ((getString as any)
              ? (getString as any)('categories.local')
              : 'Local') as any,
          ],
        );
      } catch {}
      db.runSync(createCategoryTriggerQuery);
      db.runSync(createNovelCategoryTableQuery);
      db.runSync(createRepositoryTableQuery);
      db.runSync(createNovelTriggerQueryInsert);
      db.runSync(createNovelTriggerQueryUpdate);
      db.runSync(createNovelTriggerQueryDelete);
    });
  }

  if (userVersion < 1) {
    updateToDBVersion1();
    userVersion = 1;
  }
  if (userVersion < 2) {
    updateToDBVersion2();
    userVersion = 2;
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
    const message = error instanceof Error ? error.message : String(error);
    showToast(message);
  }
};

function updateToDBVersion1() {
  db.withTransactionSync(() => {
    const cols = [
      ['chaptersDownloaded', 'INTEGER DEFAULT 0'],
      ['chaptersUnread', 'INTEGER DEFAULT 0'],
      ['totalChapters', 'INTEGER DEFAULT 0'],
      ['lastReadAt', 'TEXT'],
      ['lastUpdatedAt', 'TEXT'],
    ] as const;
    for (const [col, def] of cols) {
      if (!columnExists('Novel', col)) {
        try {
          db.runSync(`ALTER TABLE Novel ADD COLUMN ${col} ${def}`);
        } catch (e) {
          // ignore duplicate column errors
        }
      }
    }
    try {
      db.runSync(`UPDATE Novel
        SET chaptersDownloaded = (
            SELECT COUNT(*)
            FROM Chapter
            WHERE Chapter.novelId = Novel.id AND Chapter.isDownloaded = 1
        );`);
      db.runSync(`UPDATE Novel
        SET chaptersUnread = (
            SELECT COUNT(*)
            FROM Chapter
            WHERE Chapter.novelId = Novel.id AND Chapter.unread = 1
        );`);
      db.runSync(`UPDATE Novel
        SET totalChapters = (
            SELECT COUNT(*)
            FROM Chapter
            WHERE Chapter.novelId = Novel.id
        );`);
      db.runSync(`UPDATE Novel
        SET lastReadAt = (
            SELECT MAX(readTime)
            FROM Chapter
            WHERE Chapter.novelId = Novel.id
        );`);
      db.runSync(`UPDATE Novel
        SET lastUpdatedAt = (
            SELECT MAX(updatedTime)
            FROM Chapter
            WHERE Chapter.novelId = Novel.id
        );`);
    } catch {}
    db.runSync(createNovelTriggerQueryInsert);
    db.runSync(createNovelTriggerQueryUpdate);
    db.runSync(createNovelTriggerQueryDelete);
    db.execSync('PRAGMA user_version = 1');
  });
}

function updateToDBVersion2() {
  db.withTransactionSync(() => {
    try {
      if (
        columnExists('Novel', 'cover') &&
        !columnExists('Novel', 'cover_path')
      ) {
        db.runSync('ALTER TABLE Novel RENAME COLUMN cover TO cover_path');
      }

      if (!columnExists('Novel', 'cover')) {
        db.runSync('ALTER TABLE Novel ADD COLUMN cover BLOB');
      }

      const novelsToMigrate = db.getAllSync<{ id: number; cover_path: string }>(
        "SELECT id, cover_path FROM Novel WHERE cover_path IS NOT NULL AND cover_path LIKE 'file://%'",
      );

      const migratedFilePaths: string[] = [];
      for (const novel of novelsToMigrate) {
        let filePath = novel.cover_path.replace('file://', '');
        const queryParamIndex = filePath.indexOf('?');
        if (queryParamIndex > -1) {
          filePath = filePath.substring(0, queryParamIndex);
        }

        if (NativeFile.exists(filePath)) {
          const base64 = NativeFile.readFileAsBase64(filePath);
          db.runSync('UPDATE Novel SET cover = ? WHERE id = ?', [
            base64,
            novel.id,
          ]);
          migratedFilePaths.push(filePath);
        }
      }

      if (columnExists('Novel', 'cover_path')) {
        db.runSync('ALTER TABLE Novel DROP COLUMN cover_path');
      }

      db.execSync('PRAGMA user_version = 2');

      for (const path of migratedFilePaths) {
        try {
          NativeFile.unlink(path);
        } catch (e) {}
      }
    } catch (error) {
      throw error;
    }
  });
}
