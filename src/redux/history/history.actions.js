import {
    UPDATE_NOVEL_HISTORY,
    CLEAR_NOVEL_HISTORY,
    GET_HISTORY,
    LOAD_HISTORY,
} from "./history.types";
import {
    getHistory,
    insertHistory,
    deleteHistory,
} from "../../database/queries/HistoryQueries";

export const getHistoryAction = () => async (dispatch) => {
    dispatch({ type: LOAD_HISTORY });

    const history = await getHistory();

    dispatch({ type: GET_HISTORY, payload: history });
};

export const insertHistoryAction = (novelId, chapterId) => async (dispatch) => {
    await insertHistory(novelId, chapterId);

    dispatch({
        type: UPDATE_NOVEL_HISTORY,
    });
};

export const deleteHistoryAction = (novelId) => async (dispatch) => {
    await deleteHistory(novelId);

    dispatch({
        type: CLEAR_NOVEL_HISTORY,
        payload: { novelId },
    });
};
