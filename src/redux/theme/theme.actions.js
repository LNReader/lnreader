import { SWITCH_THEME } from "./theme.types";

export const switchTheme = (val) => (dispatch) => {
    dispatch({
        type: SWITCH_THEME,
        payload: val,
    });
};
