import {
    GET_LIBRARY_NOVELS,
    GET_LIBRARY_SEARCH_RESULTS,
} from "./library.types";
import {
    getLibrary,
    searchLibrary,
} from "../../Database/queries/LibraryQueries";
import { restoreBackup } from "../../Services/backup";

export const getLibraryAction = () => async (dispatch) => {
    const res = await getLibrary();

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};

export const searchLibraryAction = (searchText) => async (dispatch) => {
    const res = await searchLibrary(searchText);

    dispatch({
        type: GET_LIBRARY_SEARCH_RESULTS,
        payload: res,
    });
};

export const restoreLibraryAction = () => async (dispatch) => {
    await restoreBackup();

    const res = await getLibrary();

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};
