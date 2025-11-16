import { SQLiteDatabase } from 'expo-sqlite';

import { Migration } from '../types/migration';

const columnExists = (
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
): boolean => {
  try {
    const columns = db.getAllSync<{ name: string }>(
      `PRAGMA table_info(${tableName})`,
    );
    return columns.some(col => col.name === columnName);
  } catch {
    return false;
  }
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
    const addColumnSafely = (columnName: string, columnDefinition: string) => {
      if (!columnExists(db, 'Novel', columnName)) {
        try {
          db.runSync(`
            ALTER TABLE Novel 
            ADD COLUMN ${columnName} ${columnDefinition}
          `);
        } catch (error) {
          // Gracefully handle ALTER TABLE failures (e.g., table doesn't exist)
          // Columns will be created when table is created in initial schema
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn(
              `Failed to add column ${columnName} to Novel table:`,
              error,
            );
          }
        }
      }
    };

    addColumnSafely('chaptersDownloaded', 'INTEGER DEFAULT 0');
    addColumnSafely('chaptersUnread', 'INTEGER DEFAULT 0');
    addColumnSafely('totalChapters', 'INTEGER DEFAULT 0');
    addColumnSafely('lastReadAt', 'TEXT');
    addColumnSafely('lastUpdatedAt', 'TEXT');

    // Verify all columns exist before running UPDATE queries to prevent SQL errors
    const allColumnsExist =
      columnExists(db, 'Novel', 'chaptersDownloaded') &&
      columnExists(db, 'Novel', 'chaptersUnread') &&
      columnExists(db, 'Novel', 'totalChapters') &&
      columnExists(db, 'Novel', 'lastReadAt') &&
      columnExists(db, 'Novel', 'lastUpdatedAt');

    if (allColumnsExist) {
      try {
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
      } catch (error) {
        // Gracefully handle UPDATE failures - columns already added with defaults
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(
            'Failed to populate counter columns in Novel table:',
            error,
          );
        }
      }
    }
  },
};
