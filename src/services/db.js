import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

/**
 * Create tables
 */

export const createTables = async () => {
    db.transaction((tx) => {
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS LibraryTable (novelId INTEGER  PRIMARY KEY AUTOINCREMENT,novelUrl VARCHAR(255) UNIQUE, novelName VARCHAR(255), novelCover VARCHAR(255), novelSummary TEXT, `Author(s)` VARCHAR(255), `Genre(s)` VARCHAR(255), Status VARCHAR(255), extensionId INTEGER, libraryStatus INTEGER DEFAULT 0, unread INTEGER DEFAULT 1, lastRead VARCHAR(255), lastReadName VARCHAR(255), sourceUrl VARCHAR(255), source VARCHAR(255))",
            null,
            (tx, results) => console.log("Library Table Created"),
            (tx, error) => console.log(error)
        );

        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS ChapterTable (chapterId INTEGER PRIMARY KEY AUTOINCREMENT, chapterUrl VARCHAR(255), chapterName VARCHAR(255), releaseDate VARCHAR(255), `read` INTEGER DEFAULT 0, downloaded INTEGER DEFAULT 0,novelUrl VARCHAR(255), FOREIGN KEY (novelUrl) REFERENCES LibraryTable(novelUrl) ON DELETE CASCADE)",
            null,
            (tx, results) => console.log("Chapter Table Created"),
            (tx, error) => console.log(error)
        );
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS HistoryTable (historyId INTEGER PRIMARY KEY AUTOINCREMENT, chapterUrl VARCHAR(255), novelUrl VARCHAR(255) UNIQUE, chapterName VARCHAR(255), lastRead DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (novelUrl) REFERENCES LibraryTable(novelUrl) ON DELETE CASCADE)",
            null,
            (tx, results) => console.log("History Table Created"),
            (tx, error) => console.log(error)
        );

        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DownloadsTable (downloadId INTEGER PRIMARY KEY AUTOINCREMENT, chapterUrl VARCHAR(255), novelUrl VARCHAR(255), chapterName VARCHAR(255), chapterText VARCHAR(255), nextChapter VARCHAR(255), prevChapter VARCHAR(255), FOREIGN KEY (novelUrl) REFERENCES LibraryTable(novelUrl) ON DELETE CASCADE, UNIQUE(chapterUrl, novelUrl))",
            null,
            (tx, results) => console.log("Downloads Table Created"),
            (tx, error) => console.log(error)
        );
    });
};

/**
 * Query to create index novelUrl and chapterUrl
 */

export const createIndexes = async () => {
    db.transaction((tx) => {
        tx.executeSql(
            "CREATE INDEX IF NOT EXISTS LibraryTable_novelUrl ON LibraryTable(novelUrl)",
            null,
            (tx, results) => console.log("Library Index Created"),
            (tx, error) => console.log(error)
        );

        tx.executeSql(
            "CREATE INDEX IF NOT EXISTS ChapterTable_novelUrl ON ChapterTable(novelUrl)",
            null,
            (tx, results) => console.log("Chapter Index Created"),
            (tx, error) => console.log(error)
        );
        tx.executeSql(
            "CREATE INDEX IF NOT EXISTS HistoryTable_novelUrl ON HistoryTable(novelUrl)",
            null,
            (tx, results) => console.log("History Index Created"),
            (tx, error) => console.log(error)
        );

        tx.executeSql(
            "CREATE INDEX IF NOT EXISTS DownloadsTable_chapterUrl ON DownloadsTable(chapterUrl)",
            null,
            (tx, results) => console.log("Downloads Index Created"),
            (tx, error) => console.log(error)
        );
    });
};

export const insertNovelInfoInDb = async (novel) => {
    db.transaction((tx) => {
        tx.executeSql(
            "INSERT INTO LibraryTable (novelUrl, novelName, novelCover, novelSummary, `Author(s)`, `Genre(s)`, Status, extensionId, lastRead, lastReadName, sourceUrl, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                novel.novelUrl,
                novel.novelName,
                novel.novelCover,
                novel.novelSummary,
                novel["Author(s)"],
                novel["Genre(s)"],
                novel.Status,
                novel.extensionId,
                novel.lastRead,
                novel.lastReadName,
                novel.sourceUrl,
                novel.source,
            ],
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
    });
};

export const insertChaptersInDb = async (novelUrl, chapters) => {
    db.transaction((tx) => {
        chapters.map((chapter) =>
            tx.executeSql(
                "INSERT INTO ChapterTable (chapterUrl, chapterName, releaseDate, novelUrl) values (?, ?, ?, ?)",
                [
                    chapter.chapterUrl,
                    chapter.chapterName,
                    chapter.releaseDate,
                    novelUrl,
                ],
                (txObj, res) => {},
                (txObj, error) => console.log("Error ", error)
            )
        );
    });
};

/**
 * Get novel info from db
 */

export const getNovelInfoFromDb = (novelUrl) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM LibraryTable WHERE novelUrl=?`,
                [novelUrl],
                (txObj, { rows }) => {
                    resolve(rows.item(0));
                },
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

/**
 * Get novel chapters from db
 */

export const getChaptersFromDb = (novelUrl, filter, sort) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM ChapterTable WHERE novelUrl=? ${filter} ${sort}`,
                [novelUrl],
                (txObj, { rows: { _array } }) => {
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

/**
 * Check if novel is cached
 */

export const checkNovelInDb = (novelUrl) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable WHERE novelUrl=? LIMIT 1",
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

/**
 * Updte library status of novel
 */

export const toggleFavourite = async (libraryStatus, novelUrl) => {
    db.transaction((tx) => {
        tx.executeSql(
            "UPDATE LibraryTable SET libraryStatus = ? WHERE novelUrl=?",
            [!libraryStatus, novelUrl],
            (tx, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
    });
};

/**
 * Fetch chapter from source and download or delete from db
 */

export const downloadOrDeleteChapter = async (
    downloadStatus,
    extensionId,
    novelUrl,
    chapterUrl
) => {
    if (downloadStatus === 0) {
        const response = await fetch(
            `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}${chapterUrl}`
        );

        const chapter = await response.json();

        db.transaction((tx) => {
            tx.executeSql(
                `UPDATE ChapterTable SET downloaded = 1 WHERE chapterUrl = ? AND novelUrl = ?`,
                [chapterUrl, novelUrl]
            );
            tx.executeSql(
                `INSERT INTO DownloadsTable (chapterUrl, novelUrl, chapterName, chapterText, prevChapter, nextChapter) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    chapterUrl,
                    novelUrl,
                    chapter.chapterName,
                    chapter.chapterText,
                    chapter.prevChapter,
                    chapter.nextChapter,
                ],
                (tx, res) => console.log(`Downloaded Chapter ${chapterUrl}`),
                (txObj, error) => console.log("Error ", error)
            );
        });
    } else {
        db.transaction((tx) => {
            tx.executeSql(
                `UPDATE ChapterTable SET downloaded = 0 WHERE chapterUrl = ? AND novelUrl= ?`,
                [chapterUrl, novelUrl]
            );
            tx.executeSql(
                `DELETE FROM DownloadsTable WHERE chapterUrl = ? AND novelUrl = ?`,
                [chapterUrl, novelUrl],
                (tx, res) => console.log(`Chapter deleted`),
                (txObj, error) => console.log("Error ", error)
            );
        });
    }
};

/**
 * Get reading history
 */

export const getHistoryFromDb = async () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT HistoryTable.chapterUrl, HistoryTable.historyId, HistoryTable.chapterName, HistoryTable.lastRead, LibraryTable.novelName, LibraryTable.libraryStatus, LibraryTable.novelCover, LibraryTable.novelUrl, LibraryTable.extensionId, LibraryTable.libraryStatus FROM HistoryTable INNER JOIN LibraryTable ON HistoryTable.novelUrl = LibraryTable.novelUrl ORDER BY HistoryTable.lastRead DESC",
                null,
                (txObj, { rows: { _array } }) => {
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};

export const deleteChapterHistory = async (novelId) => {
    db.transaction((tx) => {
        tx.executeSql("DELETE FROM HistoryTable WHERE novelUrl = ?", [novelId]);
    });
};

/**
 * Get novels from library
 */

export const getLibraryFromDb = async () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable WHERE libraryStatus=1",
                null,
                (txObj, { rows: { _array } }) => {
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};

/**
 * Search novel in library
 */

export const searchInLibrary = async (searchText) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM LibraryTable WHERE libraryStatus=1 AND novelName LIKE '%${searchText}%'`,
                null,
                (txObj, { rows: { _array } }) => {
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};

export const deleteHistory = () => {
    db.transaction((tx) => {
        tx.executeSql("DELETE FROM HistoryTable; VACCUM;");
    });
};

export const deleteNovelsNotInLibrary = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "DELETE FROM LibraryTable WHERE libraryStatus = 0",
            null,
            (txObj, res) => {
                console.log("Deleted");
            },
            (txObj, error) => console.log("Error ", error)
        );
    });
};

/**
 * Delete entire database
 */
export const deleteDatabase = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "DROP TABLE LibraryTable",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED LIB TABLE");
            },
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            "DROP TABLE ChapterTable",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED CHAP TABLE");
            },
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            "DROP TABLE HistoryTable",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED History TABLE");
            },
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql(
            "DROP TABLE DownloadsTable",
            null,
            (txObj, { rows: { _array } }) => {
                console.log("DELETED Downloads TABLE");
                ToastAndroid.show("Database deleted", ToastAndroid.SHORT);
            },
            (txObj, error) => console.log("Error ", error)
        );
    });
};

export const downloadChapterFromSource = async (
    extensionId,
    novelUrl,
    chapterUrl
) => {
    const downloadUrl = `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}${chapterUrl}`;

    const response = await fetch(downloadUrl);
    const chapter = await response.json();

    db.transaction((tx) => {
        tx.executeSql(
            `UPDATE ChapterTable SET downloaded = 1 WHERE chapterUrl = ? AND novelUrl = ?`,
            [chapterUrl, novelUrl]
        );
        tx.executeSql(
            `INSERT INTO DownloadsTable (chapterUrl, novelUrl, chapterName, chapterText, prevChapter, nextChapter) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                chapterUrl,
                novelUrl,
                chapter.chapterName,
                chapter.chapterText,
                chapter.prevChapter,
                chapter.nextChapter,
            ],
            (tx, res) => console.log(`Downloaded Chapter ${chapterUrl}`),
            (txObj, error) => console.log("Error ", error)
        );
    });
};

export const deleteChapterFromDb = (extensionId, novelUrl, chapterUrl) => {
    const updateIsDownloadedQuery = `UPDATE ChapterTable SET downloaded = 0 WHERE chapterUrl = ? AND novelUrl = ? AND extensionId = ?`;
    const deleteChapterQuery = `DELETE FROM DownloadsTable WHERE chapterUrl = ? AND novelUrl = ? AND extensionId = ?`;

    db.transaction((tx) => {
        tx.executeSql(updateIsDownloadedQuery, [
            chapterUrl,
            novelUrl,
            extensionId,
        ]);
        tx.executeSql(
            deleteChapterQuery,
            [chapterUrl, novelUrl, extensionId],
            (tx, res) => console.log(`Chapter deleted`),
            (txObj, error) => console.log("Error ", error)
        );
    });
};

export const insertIntoHistory = async (chapterUrl, chapterName, novelUrl) => {
    db.transaction((tx) => {
        tx.executeSql(
            "INSERT OR REPLACE INTO HistoryTable (chapterUrl, novelUrl, chapterName, lastRead) VALUES ( ?, ?, ?, (datetime('now','localtime')))",
            [chapterUrl, novelUrl, chapterName]
        );
        tx.executeSql(
            "UPDATE LibraryTable SET lastRead = ?, lastReadName = ?, unread = 0 WHERE novelUrl = ?",
            [chapterUrl, chapterName, novelUrl]
        );
    });
};

export const chapterRead = async (chapterUrl, novelUrl) => {
    db.transaction((tx) => {
        tx.executeSql(
            "UPDATE ChapterTable SET `read` = 1 WHERE chapterUrl = ? AND novelUrl = ?",
            [chapterUrl, novelUrl],
            (tx, res) => console.log("Updated readStatus: " + novelUrl),
            (tx, error) => console.log(error)
        );
    });
};

export const isChapterDownloaded = async (chapterUrl, novelUrl) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM DownloadsTable WHERE chapterUrl=? AND novelUrl=?",
                [chapterUrl, novelUrl],
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

export const getChapterFromDb = async (chapterUrl, novelUrl) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM DownloadsTable WHERE chapterUrl = ? AND novelUrl = ?`,
                [chapterUrl, novelUrl],
                (tx, results) => {
                    resolve(results.rows.item(0));
                },
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};
