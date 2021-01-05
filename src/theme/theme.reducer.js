import { theme } from "./theme";

const initialState = {
    theme: theme,
};

const themeReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case "SWITCH_THEME":
            return { theme: payload };
        default:
            return state;
    }
};

export default themeReducer;
