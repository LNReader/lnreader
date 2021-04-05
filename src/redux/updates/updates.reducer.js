import { LOAD_UPDATES, GET_UPDATES } from "./updates.types";

const initialState = {
    updates: [],
    loading: true,
};

const updateReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case LOAD_UPDATES:
            return { ...state, loading: true };
        case GET_UPDATES:
            return { ...state, updates: payload, loading: false };
        default:
            return state;
    }
};

export default updateReducer;
