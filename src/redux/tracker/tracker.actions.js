import {
    REMOVE_TRACKER,
    SET_TRACKER,
    TRACK_NOVEL,
    UNTRACK_NOVEL,
} from "./tracker.types";

export const setTracker = (res) => async (dispatch) => {
    dispatch({
        type: SET_TRACKER,
        payload: res,
    });
};

export const removeTracker = () => async (dispatch) => {
    dispatch({ type: REMOVE_TRACKER });
};

export const trackNovel = (id) => async (dispatch) => {
    dispatch({ type: TRACK_NOVEL, payload: id });
};

export const untrackNovel = (id) => async (dispatch) => {
    dispatch({ type: UNTRACK_NOVEL, payload: id });
};
