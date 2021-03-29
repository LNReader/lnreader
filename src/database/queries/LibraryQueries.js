import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const getLibraryQuery = `SELECT * FROM novels WHERE followed = 1`;

export const getLibrary = () => {
    return new Promise((resolve, reject) =>
        db.transaction((tx) => {
            tx.executeSql(
                getLibraryQuery,
                null,
                (txObj, { rows: { _array } }) => resolve(_array),
                (txObj, error) => console.log("Error ", error)
            );
        })
    );
};

const searchLibraryQuery = `SELECT * FROM LibraryTable WHERE libraryStatus=1 AND novelName LIKE '%?%'`;

export const searchLibrary = (searchText) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                searchLibraryQuery,
                [searchText],
                (txObj, { rows: { _array } }) => resolve(_array),
                (txObj, error) => console.log("Error ", error)
            );
        });
    });
};
