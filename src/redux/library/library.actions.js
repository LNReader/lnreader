import {
    GET_LIBRARY_NOVELS,
    GET_LIBRARY_SEARCH_RESULTS,
} from "./library.types";
import {
    getLibrary,
    searchLibrary,
} from "../../database/queries/LibraryQueries";

export const getLibraryAction = () => async (dispatch) => {
    const res = await getLibrary();

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};

export const searchLibraryAction = (searchText) => async (dispatch) => {
    const res = await searchLibrary(searchText);
    console.log(searchText);

    dispatch({
        type: GET_LIBRARY_SEARCH_RESULTS,
        payload: res,
    });
};
