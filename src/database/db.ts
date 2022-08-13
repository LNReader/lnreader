import * as SQLite from 'expo-sqlite';
import {
  createNovelTableQuery,
  createUrlIndexQuery,
  createLibraryIndexQuery,
  addCategoryColumnQuery,
} from './tables/NovelTable';
import {
  createChapterTableQuery,
  createNovelIdIndexQuery,
  createUnreadChaptersIndexQuery,
} from './tables/ChapterTable';
import {
  createHistoryTableQuery,
  createChapterIdIndexQuery,
} from './tables/HistoryTable';
import { createDownloadTableQuery } from './tables/DownloadTable';
import { createUpdatesTableQuery } from './tables/UpdateTable';
import {
  createCategoriesTable,
  createCategorydIndexQuery,
  createDefaultCategory,
} from './tables/CategoryTable';

const dbName = 'lnreader.db';

const db = SQLite.openDatabase(dbName);

export const createDB = () => {
  db.transaction(tx => {
    tx.executeSql(createNovelTableQuery);
    tx.executeSql(createChapterTableQuery);
    tx.executeSql(createHistoryTableQuery);
    tx.executeSql(createDownloadTableQuery);
    tx.executeSql(createUpdatesTableQuery);
    tx.executeSql(createCategoriesTable);
    tx.executeSql(addCategoryColumnQuery);
    tx.executeSql(createDefaultCategory);

    /**
     * Indexes
     */
    tx.executeSql(createUrlIndexQuery);
    tx.executeSql(createLibraryIndexQuery);
    tx.executeSql(createNovelIdIndexQuery);
    tx.executeSql(createUnreadChaptersIndexQuery);
    tx.executeSql(createChapterIdIndexQuery);
    tx.executeSql(createCategorydIndexQuery);
  });
};

export const deleteDb = () => {
  db.transaction(tx => {
    tx.executeSql('DROP TABLE novels');
    tx.executeSql('DROP TABLE chapters');
    tx.executeSql('DROP TABLE history');
    tx.executeSql('DROP TABLE downloads');
    tx.executeSql('DROP TABLE updates');
    tx.executeSql('DROP TABLE categories');
  });
};
