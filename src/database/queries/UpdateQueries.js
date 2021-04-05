import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const getHistoryQuery = `
    SELECT chapters.chapterId, chapters.chapterUrl, chapters.chapterName, novels.novelUrl, novels.novelCover, novels.novelName, novels.sourceId, updates.updateTime, updates.updateId
    FROM updates 
    JOIN chapters 
    ON updates.chapterId = chapters.chapterId
    JOIN novels
    ON updates.novelId = novels.novelId
    ORDER BY updates.updateTime DESC`;

export const getUpdates = async () => {
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
