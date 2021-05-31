import {
    CLEAR_HISTORY,
    CLEAR_NOVEL_HISTORY,
    GET_HISTORY,
    LOAD_HISTORY,
} from "./history.types";

const initialState = {
    history: [],
    loading: true,
};

const historyReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case LOAD_HISTORY:
            return { ...state, loading: true };
        case GET_HISTORY:
            return { ...state, history: payload, loading: false };
        // case CLEAR_NOVEL_HISTORY:
        //     return {
        //         ...state,
        //         history: state.history.filter(
        //             (item) => item.novelId !== payload.novelId
        //         ),
        //     };
        case CLEAR_HISTORY:
            return { ...state, history: [] };
        default:
            return state;
    }
};

export default historyReducer;
