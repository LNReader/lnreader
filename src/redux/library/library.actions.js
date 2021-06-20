import {
    GET_LIBRARY_NOVELS,
    GET_LIBRARY_SEARCH_RESULTS,
    SET_LIBRARY_LOADING,
    SORT_FILTER_LIBRARY,
} from "./library.types";
import {
    getLibrary,
    searchLibrary,
} from "../../database/queries/LibraryQueries";
import { restoreBackup } from "../../services/backup";

export const getLibraryAction = (sort, filter) => async (dispatch) => {
    // console.log("1.", sort, filter);
    const res = await getLibrary(sort, filter);

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};

export const searchLibraryAction =
    (searchText, sort, filter) => async (dispatch) => {
        const res = await searchLibrary(searchText, sort, filter);

        dispatch({
            type: GET_LIBRARY_SEARCH_RESULTS,
            payload: res,
        });
    };

export const filterLibrary = (sort, filter) => async (dispatch) => {
    dispatch({ type: SORT_FILTER_LIBRARY, payload: { sort, filter } });

    const res = await getLibrary(sort, filter);

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};

export const restoreLibraryAction = () => async (dispatch) => {
    dispatch({ type: SET_LIBRARY_LOADING });

    const res = await restoreBackup();

    if (res) {
        const novels = await getLibrary();

        dispatch({
            type: GET_LIBRARY_NOVELS,
            payload: novels,
        });
    }
};
