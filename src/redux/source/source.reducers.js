import { GET_SOURCES } from "./source.types";

const initialState = {
    extensions: [],
    loading: true,
};

const libraryReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case GET_SOURCES:
            return { extensions: payload, loading: false };
        default:
            return state;
    }
};

export default libraryReducer;
