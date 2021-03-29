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
import { createDownloadTableQuery } from "./tables/DownloadTable";

/**
 * Database Version = 2
 */

const dbName = "lnreader.db";

const db = SQLite.openDatabase(dbName);

export const createDB = () => {
    db.transaction((tx) => {
        tx.executeSql(
            createNovelTableQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            createChapterTableQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            createHistoryTableQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            createDownloadTableQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );

        //Db indexes
        tx.executeSql(
            createUrlIndexQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            createLibraryIndexQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            createNovelIdIndexQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            createUnreadChaptersIndexQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            createChapterIdIndexQuery,
            null,
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
    });
};

export const deleteDb = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "DROP TABLE novels",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED LIB TABLE");
            },
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            "DROP TABLE chapters",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED CHAP TABLE");
            },
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            "DROP TABLE history",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED History TABLE");
            },
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            "DROP TABLE downloads",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED Downloads TABLE");
            },
            (txObj, error) => console.log("Error ", error)
        );
    });
};
