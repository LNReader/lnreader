import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const getLibraryNovelsQuery = `SELECT * FROM novels WHERE followed = 1`;

const getLibraryNovels = () => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                getLibraryNovelsQuery,
                null,
                (txObj, { rows: { _array } }) => resolve(_array),
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

const getLibraryChaptersQuery = `SELECT chapters.* FROM chapters JOIN novels ON chapters.novelId = novels.novelId WHERE novels.followed = 1`;

const getLibraryChapters = () => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                getLibraryChaptersQuery,
                null,
                (txObj, { rows: { _array } }) => resolve(_array),
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

const getLibraryDownloadsQuery = `SELECT downloads.* FROM downloads JOIN chapters ON downloads.downloadChapterId = chapters.chapterId JOIN novels ON chapters.novelId = novels.novelId WHERE novels.followed = 1`;

const getLibraryDownloads = () => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                getLibraryDownloadsQuery,
                null,
                (txObj, { rows: { _array } }) => resolve(_array),
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

const restoreNovelsQuery = `INSERT OR REPLACE INTO novels (novelId, novelUrl, sourceUrl, sourceId, source, novelName, novelCover, novelSummary, author, artist, status, genre, followed, unread) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const restoreNovels = async (novel) => {
    db.transaction((tx) =>
        tx.executeSql(
            restoreNovelsQuery,
            [
                novel.novelId,
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
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        )
    );
};

const restoreChaptersQuery = `INSERT OR IGNORE INTO chapters (novelId, chapterId, chapterUrl, chapterName, releaseDate, bookmark, \`read\`, downloaded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const restoreChapters = async (chapter) => {
    const {
        novelId,
        chapterId,
        chapterUrl,
        chapterName,
        releaseDate,
        bookmark,
        read,
        downloaded,
    } = chapter;

    db.transaction((tx) =>
        tx.executeSql(
            restoreChaptersQuery,
            [
                novelId,
                chapterId,
                chapterUrl,
                chapterName,
                releaseDate,
                bookmark,
                read,
                downloaded,
            ],
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        )
    );
};

const restoreDownloadsQuery = `INSERT OR IGNORE INTO downloads (downloadChapterId, chapterName, chapterText) VALUES (?, ?, ?)`;

const restoreDownloads = async (chapter) => {
    const { downloadChapterId, chapterName, chapterText } = chapter;

    db.transaction((tx) =>
        tx.executeSql(
            restoreDownloadsQuery,
            [downloadChapterId, chapterName, chapterText],
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        )
    );
};

export {
    getLibraryNovels,
    getLibraryChapters,
    getLibraryDownloads,
    restoreNovels,
    restoreChapters,
    restoreDownloads,
};
