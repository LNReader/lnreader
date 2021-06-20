import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const getLibraryQuery = (sort, filter) => `
    SELECT novels.*, C.chaptersUnread, D.chaptersDownloaded
    FROM novels
    LEFT JOIN (
        SELECT chapters.novelId, COUNT(*) AS chaptersUnread 
        FROM chapters
        WHERE chapters.read = 0
        GROUP BY chapters.novelId
    ) AS C
    ON novels.novelId = C.novelId
    LEFT JOIN (
        SELECT chapters.novelId, COUNT(*) AS chaptersDownloaded 
        FROM chapters
        WHERE chapters.downloaded = 1
        GROUP BY chapters.novelId
    ) AS D
    ON novels.novelId = D.novelId
    WHERE novels.followed = 1 ${filter ? "AND " + filter : ""}
    ${sort ? "ORDER BY " + sort : ""}
    `;

export const getLibrary = (sort, filter) => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                getLibraryQuery(sort, filter),
                null,
                (txObj, { rows: { _array } }) => {
                    // console.log(_array);
                    resolve(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

const searchLibraryQuery = (searchText, sort, filter) =>
    `
    SELECT novels.*, C.chaptersUnread, D.chaptersDownloaded
    FROM novels
    LEFT JOIN (
        SELECT chapters.novelId, COUNT(*) AS chaptersUnread 
        FROM chapters
        WHERE chapters.read = 0
        GROUP BY chapters.novelId
    ) AS C
    ON novels.novelId = C.novelId
    LEFT JOIN (
        SELECT chapters.novelId, COUNT(*) AS chaptersDownloaded 
        FROM chapters
        WHERE chapters.downloaded = 1
        GROUP BY chapters.novelId
    ) AS D
    ON novels.novelId = D.novelId
    WHERE novels.followed = 1 AND novelName LIKE '%${searchText}%'  ${
        filter ? "AND " + filter : ""
    }
    ${sort ? "ORDER BY " + sort : ""} `;

export const searchLibrary = (searchText, sort, filter) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                searchLibraryQuery(searchText, sort, filter),
                null,
                (txObj, { rows: { _array } }) => resolve(_array),
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};
