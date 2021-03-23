import * as SQLite from "expo-sqlite";
import { fetchNovelFromSource } from "./api";
const db = SQLite.openDatabase("lnreader.db");

export const updateNovel = async (extensionId, novelUrl) => {
    const novel = await fetchNovelFromSource(extensionId, novelUrl);

    db.transaction((tx) => {
        tx.executeSql(
            "UPDATE LibraryTable SET novelName = ?, novelCover = ?, novelSummary = ?, `Author(s)` = ?, `Genre(s)` = ?, Status = ? WHERE extensionId = ? AND novelUrl = ?",
            [
                novel.novelName,
                novel.novelCover,
                novel.novelSummary,
                novel["Author(s)"],
                novel[`Genre(s)`],
                novel.Status,
                extensionId,
                novelUrl,
            ]
        );
        novel.novelChapters.map((chapter) =>
            tx.executeSql(
                "INSERT OR IGNORE INTO ChapterTable (chapterUrl, chapterName, releaseDate, novelUrl) values (?, ?, ?, ?)",
                [
                    chapter.chapterUrl,
                    chapter.chapterName,
                    chapter.releaseDate,
                    novelUrl,
                ],
                (txObj, res) => {},
                (txObj, error) => console.log("Error ", error)
            )
        );
    });

    return novel;
};
