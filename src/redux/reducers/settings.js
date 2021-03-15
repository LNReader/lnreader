import { SET_DISPLAY_MODE } from "../actions/types";

const initialState = {
    displayMode: 0,
};

/**
 * 0 -> Compact
 * 1 -> Comfortable
 */

const settingsReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_DISPLAY_MODE:
            return { ...state, displayMode: payload };
        default:
            return state;
    }
};

export default settingsReducer;
