import { getChapter } from "../../Database/queries/ChapterQueries";
import { fetchChapter } from "../../Services/Source/source";
import { SAVE_SCROLL_POSITION } from "../preferences/preference.types";
import { CHAPTER_LOADING, GET_CHAPTER } from "./chapter.types";

export const getChapterAction =
    (sourceId, novelUrl, chapterUrl, chapterId) => async (dispatch) => {
        dispatch({ type: CHAPTER_LOADING });

        /**
         * Check if chapter is downloaded.
         */
        let chapter = await getChapter(chapterId);

        if (!chapter) {
            /**
             * Fetch chapter from source.
             */
            chapter = await fetchChapter(sourceId, novelUrl, chapterUrl);
        }

        dispatch({ type: GET_CHAPTER, payload: chapter });
    };

export const saveScrollPosition =
    (position, percentage, chapterId, novelId) => async (dispatch) => {
        dispatch({
            type: SAVE_SCROLL_POSITION,
            payload: {
                position,
                percentage,
                chapterId,
                novelId,
            },
        });
    };
