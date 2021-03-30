import { SWITCH_THEME } from "./theme.types";

/**
 * 0 -> Amoled Dark Theme
 * 1 -> Light Theme
 * 2 -> Dark Theme
 * 3 -> Midnight Dusk Theme
 */

export const switchTheme = (val) => (dispatch) => {
    dispatch({
        type: SWITCH_THEME,
        payload: val,
    });
};
