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
  createCategoriesTableQuery,
  createCategorydIndexQuery,
  createDefaultCategoryQuery,
} from './tables/CategoryTable';
import {
  dbTxnErrorCallback,
  txnErrorCallbackWithoutToast,
} from './utils/helpers';
import { noop } from 'lodash';

const dbName = 'lnreader.db';

const db = SQLite.openDatabase(dbName);

const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(createCategoriesTableQuery, [], () => {
      tx.executeSql(
        createDefaultCategoryQuery,
        undefined,
        noop,
        txnErrorCallbackWithoutToast,
      );
    });
    tx.executeSql(createNovelTableQuery, [], () => {
      tx.executeSql(
        addCategoryColumnQuery,
        undefined,
        noop,
        txnErrorCallbackWithoutToast,
      );
    });
    tx.executeSql(createChapterTableQuery);
    tx.executeSql(createHistoryTableQuery);
    tx.executeSql(createDownloadTableQuery);
    tx.executeSql(createUpdatesTableQuery);
  });
};

const createIndexes = () => {
  db.transaction(tx => {
    tx.executeSql(createUrlIndexQuery);
    tx.executeSql(createLibraryIndexQuery);
    tx.executeSql(createNovelIdIndexQuery);
    tx.executeSql(createUnreadChaptersIndexQuery);
    tx.executeSql(createChapterIdIndexQuery);
    tx.executeSql(createCategorydIndexQuery);
  });
};

export const createDatabase = async () => {
  createTables();
  createIndexes();
};

/**
 * For Testing
 */
export const deleteDatabase = () => {
  db.transaction(
    tx => {
      tx.executeSql('DROP TABLE novels');
      tx.executeSql('DROP TABLE chapters');
      tx.executeSql('DROP TABLE history');
      tx.executeSql('DROP TABLE downloads');
      tx.executeSql('DROP TABLE updates');
      tx.executeSql('DROP TABLE categories');
    },
    dbTxnErrorCallback,
    noop,
  );
};
