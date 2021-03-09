import { SWITCH_THEME } from "./types";

export const switchTheme = (theme) => (dispatch) => {
    dispatch({
        type: SWITCH_THEME,
        payload: theme,
    });
};
