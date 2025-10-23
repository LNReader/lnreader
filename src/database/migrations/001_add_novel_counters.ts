import { Migration } from '../types/migration';

/**
 * Migration 1: Add counter columns to Novel table
 * - Adds chaptersDownloaded, chaptersUnread, totalChapters columns
 * - Adds lastReadAt, lastUpdatedAt timestamp columns
 * - Populates columns with existing data
 */
export const migration001: Migration = {
  version: 1,
  description: 'Add counter columns and triggers to Novel table',
  migrate: db => {
    db.runSync(`
      ALTER TABLE Novel 
      ADD COLUMN chaptersDownloaded INTEGER DEFAULT 0
    `);
    db.runSync(`
      ALTER TABLE Novel 
      ADD COLUMN chaptersUnread INTEGER DEFAULT 0
    `);
    db.runSync(`
      ALTER TABLE Novel 
      ADD COLUMN totalChapters INTEGER DEFAULT 0
    `);
    db.runSync(`
      ALTER TABLE Novel 
      ADD COLUMN lastReadAt TEXT
    `);
    db.runSync(`
      ALTER TABLE Novel 
      ADD COLUMN lastUpdatedAt TEXT
    `);

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
