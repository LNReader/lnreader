import { SQLiteDatabase } from 'expo-sqlite';

import { Migration } from '../types/migration';

const columnExists = (
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
): boolean => {
  const columns = db.getAllSync<{ name: string }>(
    `PRAGMA table_info(${tableName})`,
  );
  return columns.some(col => col.name === columnName);
};

/**
 * Migration 2: Add counter columns to Novel table
 * - Adds chaptersDownloaded, chaptersUnread, totalChapters columns
 * - Adds lastReadAt, lastUpdatedAt timestamp columns
 * - Populates columns with existing data
 */
export const migration002: Migration = {
  version: 2,
  description: 'Add counter columns and triggers to Novel table',
  migrate: db => {
    if (!columnExists(db, 'Novel', 'chaptersDownloaded')) {
      db.runSync(`
        ALTER TABLE Novel 
        ADD COLUMN chaptersDownloaded INTEGER DEFAULT 0
      `);
    }

    if (!columnExists(db, 'Novel', 'chaptersUnread')) {
      db.runSync(`
        ALTER TABLE Novel 
        ADD COLUMN chaptersUnread INTEGER DEFAULT 0
      `);
    }

    if (!columnExists(db, 'Novel', 'totalChapters')) {
      db.runSync(`
        ALTER TABLE Novel 
        ADD COLUMN totalChapters INTEGER DEFAULT 0
      `);
    }

    if (!columnExists(db, 'Novel', 'lastReadAt')) {
      db.runSync(`
        ALTER TABLE Novel 
        ADD COLUMN lastReadAt TEXT
      `);
    }

    if (!columnExists(db, 'Novel', 'lastUpdatedAt')) {
      db.runSync(`
        ALTER TABLE Novel 
        ADD COLUMN lastUpdatedAt TEXT
      `);
    }

    db.runSync(`
      UPDATE Novel
      SET chaptersDownloaded = (
        SELECT COUNT(*)
        FROM Chapter
        WHERE Chapter.novelId = Novel.id 
          AND Chapter.isDownloaded = 1
      )
    `);

    db.runSync(`
      UPDATE Novel
      SET chaptersUnread = (
        SELECT COUNT(*)
        FROM Chapter
        WHERE Chapter.novelId = Novel.id 
          AND Chapter.unread = 1
      )
    `);

    db.runSync(`
      UPDATE Novel
      SET totalChapters = (
        SELECT COUNT(*)
        FROM Chapter
        WHERE Chapter.novelId = Novel.id
      )
    `);

    db.runSync(`
      UPDATE Novel
      SET lastReadAt = (
        SELECT MAX(readTime)
        FROM Chapter
        WHERE Chapter.novelId = Novel.id
      )
    `);

    db.runSync(`
      UPDATE Novel
      SET lastUpdatedAt = (
        SELECT MAX(updatedTime)
        FROM Chapter
        WHERE Chapter.novelId = Novel.id
      )
    `);
  },
};
