import * as FileSystem from "expo-file-system";

import * as SQLite from "expo-sqlite";
import { getLibrary } from "./LibraryQueries";
import { fetchChapters } from "../../source/Source";
import { insertChapters } from "./ChapterQueries";
const db = SQLite.openDatabase("lnreader.db");

const insertNovelQuery = `INSERT INTO novels (novelUrl, sourceUrl, sourceId, source, novelName, novelCover, novelSummary, author, artist, status, genre) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export const insertNovel = async (novel) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) =>
            tx.executeSql(
                insertNovelQuery,
                [
                    novel.novelUrl,
                    novel.sourceUrl,
                    novel.sourceId,
                    novel.source,
                    novel.novelName,
                    novel.novelCover,
                    novel.novelSummary,
                    novel.author,
                    novel.artist,
                    novel.status,
                    novel.genre,
                ],
                (txObj, { insertId }) => resolve(insertId),
                (txObj, error) => console.log("Error ", error)
            )
        )
    );
};

export const followNovel = async (followed, novelId) => {
    db.transaction((tx) => {
        tx.executeSql(
            "UPDATE novels SET followed = ? WHERE novelId = ?",
            [!followed, novelId],
            (tx, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
    });
};

const checkNovelInCacheQuery = `SELECT * FROM novels WHERE novelUrl=? LIMIT 1`;

export const checkNovelInCache = (novelUrl) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                checkNovelInCacheQuery,
                [novelUrl],
                (txObj, res) => {
                    if (res.rows.length !== 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

export const getNovel = async (novelUrl) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM novels WHERE novelUrl = ?`,
                [novelUrl],
                (txObj, { rows }) => resolve(rows.item(0)),
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

export const deleteNovelCache = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "DELETE FROM novels WHERE followed = 0",
            null,
            (txObj, res) => {
                console.log("Cleared Novel Cache");
            },
            (txObj, error) => console.log("Error ", error)
        );
    });
};

const restoreFromBackupQuery = `INSERT INTO novels (novelUrl, sourceUrl, sourceId, source, novelName, novelCover, novelSummary, author, artist, status, genre, followed, unread) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export const restoreFromBackupTx = async (novel) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) =>
            tx.executeSql(
                restoreFromBackupQuery,
                [
                    novel.novelUrl,
                    novel.sourceUrl,
                    novel.sourceId,
                    novel.source,
                    novel.novelName,
                    novel.novelCover,
                    novel.novelSummary,
                    novel.author,
                    novel.artist,
                    novel.status,
                    novel.genre,
                    novel.followed,
                    novel.unread,
                ],
                async (txObj, { insertId }) => {
                    const chapters = await fetchChapters(
                        novel.sourceId,
                        novel.novelUrl
                    );
                    await insertChapters(insertId, chapters);
                },
                (txObj, error) => console.log("Error ", error)
            )
        )
    );
};

export const createBackup = async () => {
    const libraryNovels = await getLibrary();

    const uri = FileSystem.documentDirectory + "backup.json";

    console.log(uri);

    await FileSystem.writeAsStringAsync(uri, JSON.stringify(libraryNovels));
};

export const restoreFromBackup = async () => {
    const uri = FileSystem.documentDirectory + "backup.json";

    let novels = await FileSystem.readAsStringAsync(uri);

    novels = await JSON.parse(novels);
    novels.map((novel) => restoreFromBackupTx(novel));
};
