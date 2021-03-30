import {
    SET_DISPLAY_MODE,
    SET_ITEMS_PER_ROW,
    UPDATE_READER_TEXT_SIZE,
    UPDATE_READER_THEME,
} from "./settings.types";

const initialState = {
    displayMode: 0,
    itemsPerRow: 3,
    reader: {
        theme: 1,
        textSize: 16,
    },
};

/**
 * Display Mode
 * 0 -> Compact
 * 1 -> Comfortable
 * 2 -> List
 */

/**
 * Reader Settings
 * theme
 * 1 -> Dark
 * 2 -> White
 * 3 -> Sepia
 */

const settingsReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_DISPLAY_MODE:
            return {
                ...state,
                displayMode: payload,
                itemsPerRow: payload === 2 ? 1 : state.itemsPerRow,
            };
        case SET_ITEMS_PER_ROW:
            return {
                ...state,
                itemsPerRow: state.displayMode !== 2 ? payload : 1,
            };
        case UPDATE_READER_THEME:
            return { ...state, reader: { ...state.reader, theme: payload } };
        case UPDATE_READER_TEXT_SIZE:
            return { ...state, reader: { ...state.reader, textSize: payload } };
        default:
            return state;
    }
};

export default settingsReducer;
