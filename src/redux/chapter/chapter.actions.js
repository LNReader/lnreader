import { getChapter } from "../../Database/queries/ChapterQueries";
import { fetchChapter } from "../../Services/Source/source";
import { CHAPTER_LOADING, GET_CHAPTER } from "./chapter.types";

export const getChapterAction = (
    sourceId,
    novelUrl,
    chapterUrl,
    chapterId
) => async (dispatch) => {
    dispatch({ type: CHAPTER_LOADING });

    let chapter = await getChapter(chapterId);

    if (!chapter) {
        chapter = await fetchChapter(sourceId, novelUrl, chapterUrl);
    }

    dispatch({ type: GET_CHAPTER, payload: chapter });
};
