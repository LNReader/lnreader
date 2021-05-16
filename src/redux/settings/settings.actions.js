import {
    SET_APP_THEME,
    SET_NOVELS_PER_ROW,
    SET_READER_SETTINGS,
    SET_APP_SETTINGS,
} from "./settings.types";

export const setAppTheme = (val) => (dispatch) => {
    dispatch({
        type: SET_APP_THEME,
        payload: val,
    });
};

export const setNovelsPerRow = (val) => (dispatch) => {
    dispatch({
        type: SET_NOVELS_PER_ROW,
        payload: val,
    });
};

export const setAppSettings = (key, val) => (dispatch) => {
    dispatch({
        type: SET_APP_SETTINGS,
        payload: { key, val },
    });
};

export const setReaderSettings = (key, val) => (dispatch) => {
    dispatch({
        type: SET_READER_SETTINGS,
        payload: { key, val },
    });
};
