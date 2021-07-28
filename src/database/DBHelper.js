import * as SQLite from "expo-sqlite";
import {
    createNovelTableQuery,
    createUrlIndexQuery,
    createLibraryIndexQuery,
} from "./tables/NovelTable";
import {
    createChapterTableQuery,
    createNovelIdIndexQuery,
    createUnreadChaptersIndexQuery,
} from "./tables/ChapterTable";
import {
    createHistoryTableQuery,
    createChapterIdIndexQuery,
} from "./tables/HistoryTable";
import {
    addChapterTextRawColumn,
    createDownloadTableQuery,
} from "./tables/DownloadTable";
import {
    createUpdatesTableQuery,
    updatesSeedDataQuery,
} from "./tables/UpdateTable";

/**
 * Database Version = 2
 */

const dbName = "lnreader.db";

const db = SQLite.openDatabase(dbName);

export const createDB = () => {
    db.transaction((tx) => {
        tx.executeSql(createNovelTableQuery);
        tx.executeSql(createChapterTableQuery);
        tx.executeSql(createHistoryTableQuery);
        tx.executeSql(createDownloadTableQuery);
        tx.executeSql(createUpdatesTableQuery);

        //Alter table
        tx.executeSql(addChapterTextRawColumn);

        //Db indexes
        tx.executeSql(createUrlIndexQuery);
        tx.executeSql(createLibraryIndexQuery);
        tx.executeSql(createNovelIdIndexQuery);
        tx.executeSql(createUnreadChaptersIndexQuery);
        tx.executeSql(createChapterIdIndexQuery);
    });
};

export const deleteDb = () => {
    db.transaction((tx) => {
        tx.executeSql("DROP TABLE novels");
        tx.executeSql("DROP TABLE chapters");
        tx.executeSql("DROP TABLE history");
        tx.executeSql("DROP TABLE downloads");
        tx.executeSql("DROP TABLE updates");
    });
};
