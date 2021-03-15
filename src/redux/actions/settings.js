import { SET_DISPLAY_MODE } from "./types";

export const setDisplayMode = (val) => (dispatch) => {
    dispatch({
        type: SET_DISPLAY_MODE,
        payload: val,
    });
};
