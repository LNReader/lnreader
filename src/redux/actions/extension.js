import { GET_EXTENSIONS } from "./types";
import { fetchSources } from "../../source/Source";

export const getExtensions = () => async (dispatch) => {
    const res = await fetchSources();

    dispatch({
        type: GET_EXTENSIONS,
        payload: res,
    });
};
