import { CLEAR_HISTORY, GET_HISTORY, LOAD_HISTORY } from "./history.types";

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
        case CLEAR_HISTORY:
            return { ...state, loading: false, history: [] };
        default:
            return state;
    }
};

export default historyReducer;
