import { SET_DISPLAY_MODE, SET_ITEMS_PER_ROW } from "../actions/types";

const initialState = {
    displayMode: 0,
    itemsPerRow: 3,
};

/**
 * Display Mode
 * 0 -> Compact
 * 1 -> Comfortable
 * 2 -> List
 */

const settingsReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_DISPLAY_MODE:
            return { ...state, displayMode: payload };
        case SET_ITEMS_PER_ROW:
            return { ...state, itemsPerRow: payload };
        default:
            return state;
    }
};

export default settingsReducer;
