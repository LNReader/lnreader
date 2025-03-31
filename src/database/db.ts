import * as SQLite from 'expo-sqlite';
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
import { createTranslationTableQuery } from './tables/TranslationTable';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabase(dbName);

export const createTables = () => {
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
    tx.executeSql(createTranslationTableQuery);
  });

  // Run migrations
  migrateDatabase();
};

/**
 * Database migration to handle schema changes
 */
export const migrateDatabase = () => {
  // We'll only log the "Running database migrations" message when actual migrations happen
  let didRunMigration = false;

  // Add hasTranslation column to Chapter table if it doesn't exist
  db.transaction(tx => {
    // First check if the column exists
    tx.executeSql(
      'PRAGMA table_info(Chapter)',
      [],
      (_, { rows }) => {
        const columns = rows._array;
        const hasTranslationExists = columns.some(
          col => col.name === 'hasTranslation',
        );

        if (!hasTranslationExists) {
          // Only log when actual migration happens
          console.log('Running database migrations...');
          didRunMigration = true;

          console.log('Adding hasTranslation column to Chapter table');
          tx.executeSql(
            'ALTER TABLE Chapter ADD COLUMN hasTranslation INTEGER DEFAULT 0',
            [],
            () => {
              console.log('Successfully added hasTranslation column');

              // Update existing translations if any
              tx.executeSql(
                `UPDATE Chapter SET hasTranslation = 1 
                 WHERE id IN (SELECT chapterId FROM Translation)`,
                [],
                () => console.log('Updated existing translations'),
                (_, error) => {
                  console.error('Error updating translations:', error);
                  return false;
                },
              );
            },
            (_, error) => {
              console.error('Error adding hasTranslation column:', error);
              return false;
            },
          );
        }
      },
      (_, error) => {
        console.error('Error checking for hasTranslation column:', error);
        return false;
      },
    );
  });

  // Add more migrations here in the future
  // Each should set didRunMigration to true if they actually do something

  return didRunMigration;
};

/**
 * For Testing
 */
export const deleteDatabase = async () => {
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
};
