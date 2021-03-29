import * as SQLite from "expo-sqlite";
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
