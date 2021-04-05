import { GET_LIBRARY_NOVELS } from "./library.types";
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

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};
