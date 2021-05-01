import {
    amoledDarkTheme,
    lightTheme,
    darkTheme,
    midnightDuskTheme,
} from "../../Theme/theme";

const themes = {
    0: amoledDarkTheme,
    1: lightTheme,
    2: darkTheme,
    3: midnightDuskTheme,
};

const initialState = {
    theme: themes[0],
};

const themeReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case "SWITCH_THEME":
            return { ...state, theme: themes[payload] };
        default:
            return state;
    }
};

export default themeReducer;
