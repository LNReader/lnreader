import { FOLLOW_NOVEL, UNFOLLOW_NOVEL } from "../novel/novel.types";
import {
    GET_LIBRARY_NOVELS,
    GET_LIBRARY_SEARCH_RESULTS,
} from "./library.types";

const initialState = {
    novels: [],
    searchResults: [],
    loading: true,
};

const libraryReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case GET_LIBRARY_NOVELS:
            return { ...state, novels: payload, loading: false };
        case GET_LIBRARY_SEARCH_RESULTS:
            return { ...state, searchResults: payload, loading: false };
        case FOLLOW_NOVEL:
            return {
                ...state,
                novels: [...state.novels, { ...payload, followed: 1 }],
            };
        case UNFOLLOW_NOVEL:
            return {
                ...state,
                novels: state.novels.filter(
                    (novel) => novel.novelId !== payload
                ),
            };
        default:
            return state;
    }
};

export default libraryReducer;
