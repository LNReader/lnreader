<<<<<<< HEAD
=======
import { UPDATE_IN_LIBRARY } from "../novel/novel.types";
>>>>>>> 8f254b4ef52a9f5a8ce6d6ee1cbbb7d4c0e62d3d
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
        default:
            return state;
    }
};

export default libraryReducer;
