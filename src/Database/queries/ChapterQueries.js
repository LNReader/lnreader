import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const insertChaptersQuery = `INSERT INTO chapters (chapterUrl, chapterName, releaseDate, novelId) values (?, ?, ?, ?)`;

export const insertChapters = async (novelId, chapters) => {
    db.transaction((tx) => {
        chapters.map(
            (chapter) =>
                tx.executeSql(
                    insertChaptersQuery,
                    [
                        chapter.chapterUrl,
                        chapter.chapterName,
                        chapter.releaseDate,
                        novelId,
                    ],
                    (txObj, res) => {},
                    (txObj, error) =>
                        console.log(
                            "Error ",
                            error,
                            " Chapter URL: ",
                            chapter.chapterUrl,
                            " Novel ID ",
                            novelId
                        )
                ),
            (txObj, res) => {
                console.log("Success");
            },
            (txObj, error) => console.log("Error ", error)
        );
    });
};

const getChaptersQuery = (sort, filter) =>
    `SELECT * FROM chapters WHERE novelId = ? ${filter || ""} ${
        sort || "ORDER BY chapterId ASC"
    }`;

export const getChapters = (novelId, sort, filter) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                getChaptersQuery(sort, filter),
                [novelId],
                (txObj, { rows: { _array } }) => {
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

const getChapterQuery = `SELECT * FROM downloads WHERE downloadChapterId = ?`;

export const getChapter = async (chapterId) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                getChapterQuery,
                [chapterId],
                (tx, results) => {
                    resolve(results.rows.item(0));
                },
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

const markChapterReadQuery = `UPDATE chapters SET \`read\` = 1 WHERE chapterId = ?`;

export const markChapterRead = async (chapterId) => {
    db.transaction((tx) => {
        tx.executeSql(
            markChapterReadQuery,
            [chapterId],
            (tx, res) => {},
            (tx, error) => console.log(error)
        );
    });
};

const markChapterUnreadQuery = `UPDATE chapters SET \`read\` = 0 WHERE chapterId = ?`;

export const markChapterUnread = async (chapterId) => {
    db.transaction((tx) => {
        tx.executeSql(
            markChapterUnreadQuery,
            [chapterId],
            (tx, res) => {},
            (tx, error) => console.log(error)
        );
    });
};

const isChapterDownloadedQuery = `SELECT * FROM downloads WHERE downloadChapterId=?`;

export const isChapterDownloaded = async (chapterId) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                isChapterDownloadedQuery,
                [chapterId],
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

const downloadChapterQuery = `INSERT INTO downloads (downloadChapterId, chapterName, chapterText, prevChapter, nextChapter) VALUES (?, ?, ?, ?, ?)`;

export const downloadChapter = async (
    sourceId,
    novelUrl,
    chapterUrl,
    chapterId
) => {
    const downloadUrl = `https://lnreader-extensions.vercel.app/api/${sourceId}/novel/${novelUrl}${chapterUrl}`;

    const response = await fetch(downloadUrl);
    const chapter = await response.json();

    db.transaction((tx) => {
        tx.executeSql(
            `UPDATE chapters SET downloaded = 1 WHERE chapterId = ?`,
            [chapterId]
        );
        tx.executeSql(
            downloadChapterQuery,
            [
                chapterId,
                chapter.chapterName,
                chapter.chapterText,
                chapter.prevChapter,
                chapter.nextChapter,
            ],
            (tx, res) =>
                console.log(`Downloaded Chapter ${chapter.chapterUrl}`),
            (txObj, error) => console.log("Error ", error)
        );
    });
};

export const deleteChapter = async (chapterId) => {
    const updateIsDownloadedQuery = `UPDATE chapters SET downloaded = 0 WHERE chapterId=?`;
    const deleteChapterQuery = `DELETE FROM downloads WHERE downloadChapterId=?`;

    db.transaction((tx) => {
        tx.executeSql(
            updateIsDownloadedQuery,
            [chapterId],
            (tx, res) => console.log(`Chaptermarked not downapdeod deleted`),
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            deleteChapterQuery,
            [chapterId],
            (tx, res) => console.log(`Chapter deleted`),
            (txObj, error) => console.log("Error ", error)
        );
    });
};

const getLastReadChapterQuery = `
    SELECT chapters.*
    FROM history
    JOIN chapters
    ON history.historyChapterId = chapters.chapterId
    WHERE history.historyNovelId = ?
`;

export const getLastReadChapter = async (novelId) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                getLastReadChapterQuery,
                [novelId],
                (tx, { rows }) => resolve(rows.item(0)),
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};

const bookmarkChapterQuery = `UPDATE chapters SET bookmark = ? WHERE chapterId = ?`;

export const bookmarkChapter = async (bookmark, chapterId) => {
    db.transaction((tx) => {
        tx.executeSql(
            bookmarkChapterQuery,
            [!bookmark, chapterId],
            (tx, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
    });
};
