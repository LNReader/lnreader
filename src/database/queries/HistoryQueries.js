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
                    // console.log(_array);
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
            "INSERT OR REPLACE INTO history (historyNovelId, historyChapterId) VALUEs (?, ?)",
            [novelId, chapterId],
            (txObj, { rows: { _array } }) => {},
            (txObj, error) => console.log("Error ", error)
        );
        tx.executeSql("UPDATE chapters SET `read` = 1 WHERE chapterId = ?", [
            chapterId,
        ]);
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
