import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

import { getLibrary } from "../database/queries/LibraryQueries";
import { fetchChapters, fetchNovel } from "../services/Source/source";
import * as Notifications from "expo-notifications";

import BackgroundService from "react-native-background-actions";

Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        };
    },
});

const updateNovelDetails = async (novel, novelId) => {
    db.transaction((tx) => {
        tx.executeSql(
            "UPDATE novels SET novelName = ?, novelCover = ?, novelSummary = ?, author = ?, artist = ?, genre = ?, status = ? WHERE novelId = ?",
            [
                novel.novelName,
                novel.novelCover,
                novel.novelSummary,
                novel.author,
                novel.artist,
                novel.genre,
                novel.status,
                novelId,
            ],
            (txObj, res) => {},
            (txObj, error) => console.log("Error ", error)
        );
    });
};

export const updateNovel = async (sourceId, novelUrl, novelId) => {
    let novel = await fetchNovel(sourceId, novelUrl);

    await updateNovelDetails(novel, novelId);

    db.transaction((tx) => {
        novel.chapters.map((chapter) =>
            tx.executeSql(
                "INSERT OR IGNORE INTO chapters (chapterUrl, chapterName, releaseDate, novelId) values (?, ?, ?, ?)",
                [
                    chapter.chapterUrl,
                    chapter.chapterName,
                    chapter.releaseDate,
                    novelId,
                ],
                (txObj, { insertId }) => {
                    if (insertId !== -1) {
                        tx.executeSql(
                            "INSERT OR IGNORE INTO updates (chapterId, novelId, updateTime) values (?, ?, (datetime('now','localtime')))",
                            [insertId, novelId],
                            (txObj, res) => {
                                console.log(
                                    "Inserted Chapter Id -> " +
                                        insertId +
                                        " Novel Id " +
                                        novelId
                                );
                            },
                            (txObj, error) => console.log("Error ", error)
                        );
                    }
                },
                (txObj, error) => console.log("Error ", error)
            )
        );
    });
};

export const updateNovelChapters = async (sourceId, novelUrl, novelId) => {
    let chapters = await fetchChapters(sourceId, novelUrl);

    db.transaction((tx) => {
        chapters.map((chapter) =>
            tx.executeSql(
                "INSERT OR IGNORE INTO chapters (chapterUrl, chapterName, releaseDate, novelId) values (?, ?, ?, ?)",
                [
                    chapter.chapterUrl,
                    chapter.chapterName,
                    chapter.releaseDate,
                    novelId,
                ],
                (txObj, { insertId }) => {
                    if (insertId !== -1) {
                        console.log(
                            "Inserted Chapter " +
                                chapter.chapterUrl +
                                " Chapter Name " +
                                chapter.chapterName +
                                " Novel Id " +
                                novelId
                        );
                        tx.executeSql(
                            "INSERT OR IGNORE INTO updates (chapterId, novelId, updateTime) values (?, ?, (datetime('now','localtime')))",
                            [insertId, novelId],
                            (txObj, res) => {},
                            (txObj, error) => console.log("Error ", error)
                        );
                    }
                },
                (txObj, error) => console.log("Error ", error)
            )
        );
    });
};

export const updateAllNovels = async () => {
    const libraryNovels = await getLibrary();

    const options = {
        taskName: "Library Update",
        taskTitle: "Updating library",
        taskDesc: "0/" + libraryNovels.length,
        taskIcon: {
            name: "notification_icon",
            type: "drawable",
        },
        color: "#00adb5",
        parameters: {
            delay: 1000,
        },
        progressBar: {
            max: libraryNovels.length,
            value: 0,
        },
    };

    const sleep = (time) =>
        new Promise((resolve) => setTimeout(() => resolve(), time));

    const veryIntensiveTask = async (taskData) =>
        await new Promise(async (resolve) => {
            for (
                let i = 0;
                BackgroundService.isRunning() && i < libraryNovels.length;
                i++
            ) {
                if (BackgroundService.isRunning()) {
                    await updateNovelChapters(
                        libraryNovels[i].sourceId,
                        libraryNovels[i].novelUrl,
                        libraryNovels[i].novelId
                    );
                    console.log(libraryNovels[i].novelName + " Updated");
                    await BackgroundService.updateNotification({
                        taskTitle: libraryNovels[i].novelName,
                        taskDesc: i + 1 + "/" + libraryNovels.length,
                        progressBar: {
                            max: libraryNovels.length,
                            value: i + 1,
                        },
                    });
                    if (libraryNovels.length === i + 1) {
                        resolve();
                        await BackgroundService.stop();
                        Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Library Updated",
                                body: libraryNovels.length + " novels updated",
                            },
                            trigger: null,
                        });
                    }

                    await sleep(taskData.delay);
                }
            }
        });

    await BackgroundService.start(veryIntensiveTask, options);
};

export const parseChapterNumber = (chapterName) => {
    chapterName = chapterName.toLowerCase();
    chapterName = chapterName.replace(/volume (\d+)/, "");

    const basic = chapterName.match(/ch (\d+)/);

    const occurrence = chapterName.match(/\d+/);

    if (basic) {
        return basic[0];
    } else if (occurrence) {
        return occurrence[0];
    } else {
        return 0;
    }
};
