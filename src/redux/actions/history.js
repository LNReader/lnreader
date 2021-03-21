import {
    UPDATE_NOVEL_HISTORY,
    CLEAR_NOVEL_HISTORY,
    GET_HISTORY,
    LOAD_HISTORY,
} from "./types";
import {
    getHistoryFromDb,
    insertIntoHistory,
    deleteChapterHistory,
} from "../../services/db";

export const getHistory = () => async (dispatch) => {
    dispatch({ type: LOAD_HISTORY });

    const history = await getHistoryFromDb();

    dispatch({ type: GET_HISTORY, payload: history });
};

export const updateNovelHistory = (chapterUrl, chapterName, novelUrl) => async (
    dispatch
) => {
    await insertIntoHistory(chapterUrl, chapterName, novelUrl);

    dispatch({
        type: UPDATE_NOVEL_HISTORY,
    });
};

export const deleteChapterFromHistory = (novelUrl) => async (dispatch) => {
    await deleteChapterHistory(novelUrl);

    dispatch({
        type: CLEAR_NOVEL_HISTORY,
        payload: { novelUrl },
    });
};
