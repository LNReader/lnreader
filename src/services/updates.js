import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

import { getLibrary } from "../database/queries/LibraryQueries";
import { fetchChapters, fetchNovel } from "../Services/Source/source";
import { ToastAndroid } from "react-native";

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

export const updateNovel = async (extensionId, novelUrl, novelId) => {
    let novel = await fetchNovel(extensionId, novelUrl);
    // console.log(novel);
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

export const updateNovelChapters = async (extensionId, novelUrl, novelId) => {
    let chapters = await fetchChapters(extensionId, novelUrl);

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
                            (txObj, res) => {
                                // console.log(
                                //     "Inserted Chapter Id -> " +
                                //         insertId +
                                //         " Novel Id " +
                                //         novelId
                                // );
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

export const updateAllNovels = async () => {
    const libraryNovels = await getLibrary();

    libraryNovels.map((novel, index) =>
        setTimeout(async () => {
            updateNovelChapters(novel.sourceId, novel.novelUrl, novel.novelId);
            console.log(novel.novelName + " Updated");
        }, 3000 * index)
    );
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
