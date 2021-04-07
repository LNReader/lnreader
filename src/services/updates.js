import * as SQLite from "expo-sqlite";
import { getLibrary } from "../database/queries/LibraryQueries";
import { fetchNovel } from "../source/Source";
const db = SQLite.openDatabase("lnreader.db");
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
                        console.log(insertId);
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

export const updateAllNovels = async () => {
    ToastAndroid.show("Updating library", ToastAndroid.SHORT);

    const libraryNovels = await getLibrary();

    libraryNovels.map((novel, index) =>
        setTimeout(async () => {
            updateNovel(novel.sourceId, novel.novelUrl, novel.novelId);
            console.log(novel.novelName + " Updated");
        }, 3000 * index)
    );
};
