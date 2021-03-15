import { GET_LIBRARY_NOVELS } from "./types";
import { getLibraryFromDb, searchInLibrary } from "../../services/db";

export const getLibraryNovels = () => async (dispatch) => {
    const res = await getLibraryFromDb();

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};

export const searchLibraryNovels = (searchText) => async (dispatch) => {
    const res = await searchInLibrary(searchText);

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });
};
