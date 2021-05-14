import {
    GET_LIBRARY_NOVELS,
    GET_LIBRARY_SEARCH_RESULTS,
    SET_LIBRARY_LOADING,
    SORT_FILTER_LIBRARY,
} from "./library.types";

const initialState = {
    novels: [],
    searchResults: [],
    filters: { sort: "novels.novelId ASC", filter: "" },
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
        case SORT_FILTER_LIBRARY:
            console.log("2.", payload.sort, payload.filter);
            return {
                ...state,
                filters: { sort: payload.sort, filter: payload.filter },
            };
        default:
            return state;
    }
};

export default libraryReducer;
