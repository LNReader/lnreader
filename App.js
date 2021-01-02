import React, { useState, useEffect } from "react";
import Router from "./src/navigation/Router";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const getFonts = () =>
    Font.loadAsync({
        "pt-sans-bold": require("./assets/fonts/PTSansNarrow-Bold.ttf"),
    });

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const createTables = () =>
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
                "CREATE TABLE IF NOT EXISTS HistoryTable (historyId INTEGER PRIMARY KEY AUTOINCREMENT, chapterUrl VARCHAR(255) UNIQUE, novelUrl VARCHAR(255) UNIQUE, chapterName VARCHAR(255), lastRead DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (novelUrl) REFERENCES LibraryTable(novelUrl) ON DELETE CASCADE)",
                null,
                (tx, results) => console.log("History Table Created"),
                (tx, error) => console.log(error)
            );

            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS DownloadsTable (downloadId INTEGER PRIMARY KEY AUTOINCREMENT, chapterUrl VARCHAR(255) UNIQUE, novelUrl VARCHAR(255), chapterName VARCHAR(255), chapterText VARCHAR(255), nextChapter VARCHAR(255), prevChapter VARCHAR(255), FOREIGN KEY (novelUrl) REFERENCES LibraryTable(novelUrl) ON DELETE CASCADE)",
                null,
                (tx, results) => console.log("Downloads Table Created"),
                (tx, error) => console.log(error)
            );
            // tx.executeSql(
            //     "CREATE TABLE IF NOT EXISTS UpdatesTable (chapterId INTEGER, novelUrl VARCHAR(255))",
            //     null,
            //     (tx, results) => console.log("Updates Table Created"),
            //     (tx, error) => console.log(error)
            // );
        });

    useEffect(() => {
        createTables();
    }, []);

    if (fontsLoaded) {
        return (
            <>
                <StatusBar style="light" />
                <NavigationContainer>
                    <Router />
                </NavigationContainer>
            </>
        );
    } else {
        return (
            <AppLoading
                startAsync={getFonts}
                onError={() => warn(error)}
                onFinish={() => setFontsLoaded(true)}
            />
        );
    }
}
