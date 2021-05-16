import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const getHistoryQuery = `
    SELECT history.*, chapters.*, novels.*
    FROM history 
    JOIN chapters 
    ON history.historyChapterId = chapters.chapterId
    JOIN novels
    ON history.historyNovelId = novels.novelId
    ORDER BY history.historyTimeRead DESC`;

export const getHistory = async () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                getHistoryQuery,
                null,
                (txObj, { rows: { _array } }) => {
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};

// const insertHistoryQuery =

export const insertHistory = async (novelId, chapterId) => {
    db.transaction((tx) => {
        tx.executeSql(
            "INSERT OR REPLACE INTO history (historyNovelId, historyChapterId, historyTimeRead) VALUES (?, ?, (datetime('now','localtime')))",
            [novelId, chapterId],
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql("UPDATE novels SET unread = 0 WHERE novelId = ?", [
            novelId,
        ]);
    });
};

export const deleteHistory = async (novelId) => {
    db.transaction((tx) => {
        tx.executeSql("DELETE FROM history WHERE historyNovelId = ?", [
            novelId,
        ]);
    });
};

export const deleteAllHistory = () => {
    db.transaction((tx) => {
        tx.executeSql("DELETE FROM history; VACCUM;");
    });
};

export const getHistoryDates = async () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT DISTINCT strftime('%d-%m-%Y', historyTimeRead) as day from history",
                null,
                (txObj, { rows: { _array } }) => {
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};
