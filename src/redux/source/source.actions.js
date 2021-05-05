import { GET_SOURCES, PIN_SOURCES, SEARCH_SOURCES } from "./source.types";
import { fetchSources } from "../../Services/Source/source";

export const getSourcesAction = () => async (dispatch) => {
    const res = await fetchSources();

    dispatch({
        type: GET_SOURCES,
        payload: res,
    });
};

export const searchSourcesAction = (searchText) => async (dispatch) => {
    dispatch({
        type: SEARCH_SOURCES,
        payload: searchText,
    });
};

export const pinSourceAction = (sourceId) => async (dispatch) => {
    dispatch({
        type: PIN_SOURCES,
        payload: sourceId,
    });
};
