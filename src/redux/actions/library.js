import { GET_LIBRARY_NOVELS } from "./types";
import { getLibraryFromDb } from "../../services/db";

export const getLibraryNovels = () => async (dispatch) => {
    getLibraryFromDb().then((res) => console.log(res));

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res.data,
    });
};
