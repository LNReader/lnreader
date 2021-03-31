import { GET_SOURCES } from "./source.types";
import { fetchSources } from "../../source/Source";

export const getSourcesAction = () => async (dispatch) => {
    const res = await fetchSources();

    dispatch({
        type: GET_SOURCES,
        payload: res,
    });
};
