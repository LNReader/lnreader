import { GET_EXTENSIONS } from "./types";
import { fetchExtensionList } from "../../services/api";

export const getExtensions = () => async (dispatch) => {
    const res = await fetchExtensionList();

    dispatch({
        type: GET_EXTENSIONS,
        payload: res,
    });
};
