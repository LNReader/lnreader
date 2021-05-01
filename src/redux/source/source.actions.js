import { GET_SOURCES } from "./source.types";
import { fetchSources } from "../../Services/Source/source";

export const getSourcesAction = () => async (dispatch) => {
    const res = await fetchSources();

    dispatch({
        type: GET_SOURCES,
        payload: res,
    });
};
