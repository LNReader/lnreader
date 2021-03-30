import { GET_LIBRARY_NOVELS } from "./types";
import {
    getLibrary,
    searchLibrary,
} from "../../database/queries/LibraryQueries";

export const getLibraryAction = () => async (dispatch) => {
    const res = await getLibrary();
    console.log(res);
    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};

export const searchLibraryAction = (searchText) => async (dispatch) => {
    console.log(searchText);
    const res = await searchLibrary(searchText);

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};
