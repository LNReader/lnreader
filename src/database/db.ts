import * as SQLite from 'expo-sqlite';
import {
  createCategoriesTableQuery,
  createCategoryTrigger,
  createDefaultCategoryQuery,
} from './tables/CategoryTable';
import { createNovelTableQuery } from './tables/NovelTable';
import { createNovelCategoryTableQuery } from './tables/NovelCategoryTable';
import { createChapterTableQuery } from './tables/ChapterTable';
import { createHistoryTableQuery } from './tables/HistoryTable';
import { createDownloadTableQuery } from './tables/DownloadTable';
import { dbTxnErrorCallback, txnErrorCallback } from './utils/helpers';
import { noop } from 'lodash-es';

const dbName = 'lnreader.db';

const db = SQLite.openDatabase(dbName);

export const createTables = async () => {
  db.transaction(tx => {
    tx.executeSql(createCategoriesTableQuery, [], () => {
      tx.executeSql(createCategoryTrigger, undefined, noop, txnErrorCallback);
      tx.executeSql(
        createDefaultCategoryQuery,
        undefined,
        noop,
        txnErrorCallback,
      );
    });
    tx.executeSql(createNovelTableQuery);
    tx.executeSql(createNovelCategoryTableQuery);
    tx.executeSql(createChapterTableQuery);
    tx.executeSql(createHistoryTableQuery);
    tx.executeSql(createDownloadTableQuery);
  });
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
      tx.executeSql('DROP TABLE History');
      tx.executeSql('DROP TABLE Download');
    },
    dbTxnErrorCallback,
    noop,
  );
};
