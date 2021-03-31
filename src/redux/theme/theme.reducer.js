import {
    amoledDarkTheme,
    lightTheme,
    darkTheme,
    midnightDuskTheme,
} from "../../theme/theme";

const themes = {
    0: amoledDarkTheme,
    1: lightTheme,
    2: darkTheme,
    3: midnightDuskTheme,
};

const initialState = {
    themeCode: 0,
    theme: themes[0],
};

const themeReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case "SWITCH_THEME":
            return { ...state, themeCode: payload, theme: themes[payload] };
        default:
            return state;
    }
};

export default themeReducer;
