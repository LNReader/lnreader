import { GET_LIBRARY_NOVELS } from "./library.types";

const initialState = {
    novels: [],
    loading: true,
};

const libraryReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case GET_LIBRARY_NOVELS:
            return { novels: payload, loading: false };
        default:
            return state;
    }
};

export default libraryReducer;
