import { UPDATE_IN_LIBRARY } from "../novel/novel.types";
import {
    GET_LIBRARY_NOVELS,
    GET_LIBRARY_SEARCH_RESULTS,
    SET_LIBRARY_LOADING,
} from "./library.types";

const initialState = {
    novels: [],
    searchResults: [],
    loading: true,
};

const libraryReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_LIBRARY_LOADING:
            return { ...state, loading: true };
        case GET_LIBRARY_NOVELS:
            return { ...state, novels: payload, loading: false };
        case GET_LIBRARY_SEARCH_RESULTS:
            return { ...state, novels: payload, loading: false };
        case UPDATE_IN_LIBRARY:
            return {
                ...state,
                novels: [...state.novels, { novelUrl: payload.novelUrl }],
            };
        default:
            return state;
    }
};

export default libraryReducer;
