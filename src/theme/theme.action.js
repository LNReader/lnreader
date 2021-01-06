import { SWITCH_THEME } from "./constants";

export const switchTheme = (theme) => (dispatch) => {
    dispatch({
        type: SWITCH_THEME,
        payload: theme,
    });
};
