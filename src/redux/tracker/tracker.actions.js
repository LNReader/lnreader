import { findListItem, updateItem } from "../../trackers/MyAnimeList";
import {
    REMOVE_TRACKER,
    SET_TRACKER,
    TRACK_NOVEL,
    UNTRACK_NOVEL,
    UPDATE_TRACKER,
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

export const trackNovel = (trackObj, accessToken) => async (dispatch) => {
    let res = await findListItem(trackObj.id, accessToken);

    trackObj.my_list_status = {
        num_chapters_read: res.my_list_status.num_chapters_read,
        score: res.my_list_status.score,
        status: res.my_list_status.status,
    };

    dispatch({ type: TRACK_NOVEL, payload: trackObj });
};

export const updateTracker = (malId, accessToken, body) => async (dispatch) => {
    let res = await updateItem(malId, accessToken, body);

    dispatch({ type: UPDATE_TRACKER, payload: { malId, ...res } });
};

export const untrackNovel = (id) => async (dispatch) => {
    dispatch({ type: UNTRACK_NOVEL, payload: id });
};
