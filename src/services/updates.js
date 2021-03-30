import * as SQLite from "expo-sqlite";
import { fetchNovel } from "../source/Source";
const db = SQLite.openDatabase("lnreader.db");

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
                (txObj, res) => {},
                (txObj, error) => console.log("Error ", error)
            )
        );
    });

    return novel;
};
