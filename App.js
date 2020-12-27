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
                "CREATE TABLE IF NOT EXISTS LibraryTable (novelUrl VARCHAR(255) PRIMARY KEY, novelName VARCHAR(255), novelCover VARCHAR(255), novelSummary TEXT, Alternative VARCHAR(255), `Author(s)` VARCHAR(255), `Genre(s)` VARCHAR(255), Type VARCHAR(255), `Release` VARCHAR(255), Status VARCHAR(255), extensionId INTEGER)",
                null,
                (tx, results) => console.log("Library Table Created"),
                (tx, error) => console.log(error)
            );

            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS ChapterTable (chapterId INTEGER PRIMARY KEY AUTOINCREMENT, chapterUrl VARCHAR(255), chapterName VARCHAR(255), releaseDate VARCHAR(255), novelUrl VARCHAR(255), FOREIGN KEY (novelUrl) REFERENCES LibraryTable(novelUrl) ON DELETE CASCADE)",
                null,
                (tx, results) => console.log("Chapter Table Created"),
                (tx, error) => console.log(error)
            );
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
