import {
    UPDATE_NOVEL_HISTORY,
    CLEAR_NOVEL_HISTORY,
    GET_HISTORY,
    LOAD_HISTORY,
    CLEAR_HISTORY,
} from "./history.types";
import {
    getHistory,
    insertHistory,
    deleteHistory,
    deleteAllHistory,
} from "../../Database/queries/HistoryQueries";
import { SET_LAST_READ } from "../preferences/preference.types";

export const getHistoryAction = () => async (dispatch) => {
    dispatch({ type: LOAD_HISTORY });

    const history = await getHistory();

    const groups = history.reduce((groups, update) => {
        var dateParts = update.historyTimeRead.split("-");
        var jsDate = new Date(
            dateParts[0],
            dateParts[1] - 1,
            dateParts[2].substr(0, 2)
        );
        const date = jsDate.toISOString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(update);
        return groups;
    }, {});

    const groupedHistory = Object.keys(groups).map((date) => {
        return {
            date,
            novels: groups[date],
        };
    });

    dispatch({ type: GET_HISTORY, payload: groupedHistory });
};

export const insertHistoryAction = (novelId, chapterId) => async (dispatch) => {
    await insertHistory(novelId, chapterId);

    dispatch({
        type: SET_LAST_READ,
        payload: { novelId, chapterId },
    });

    dispatch(getHistoryAction());
};

export const deleteHistoryAction = (novelId) => async (dispatch) => {
    await deleteHistory(novelId);

    dispatch({
        type: CLEAR_NOVEL_HISTORY,
        payload: { novelId },
    });
};

export const clearAllHistoryAction = () => async (dispatch) => {
    deleteAllHistory();

    dispatch({ type: CLEAR_HISTORY });
};
