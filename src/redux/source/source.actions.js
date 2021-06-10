import { GET_SOURCES, PIN_SOURCES, SEARCH_SOURCES } from "./source.types";
import { fetchSources } from "../../Services/Source/source";
import { showToast } from "../../Hooks/showToast";
import { sources } from "../../sources/sources";

export const getSourcesAction = () => async (dispatch) => {
    try {
        dispatch({ type: GET_SOURCES, payload: sources });
    } catch (error) {
        showToast(error.message);
    }
};

export const searchSourcesAction = (searchText) => async (dispatch) => {
    const res = searchText.toLowerCase();

    dispatch({
        type: SEARCH_SOURCES,
        payload: res,
    });
};

export const pinSourceAction = (sourceId) => async (dispatch) => {
    dispatch({
        type: PIN_SOURCES,
        payload: sourceId,
    });
};
