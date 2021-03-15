import { SET_DISPLAY_MODE, SET_ITEMS_PER_ROW } from "./types";

export const setDisplayMode = (val) => (dispatch) => {
    dispatch({
        type: SET_DISPLAY_MODE,
        payload: val,
    });
};

export const setItemsPerRow = (val) => (dispatch) => {
    dispatch({
        type: SET_ITEMS_PER_ROW,
        payload: val,
    });
};
