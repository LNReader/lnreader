import {
    CLEAR_NOVEL_HISTORY,
    GET_HISTORY,
    LOAD_HISTORY,
    UPDATE_NOVEL_HISTORY,
} from "../actions/types";

const initialState = {
    history: [],
    loading: true,
};

const historyReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case LOAD_HISTORY:
            return { ...state, loading: true };
        case GET_HISTORY:
            return { ...state, history: payload, loading: false };
        case UPDATE_NOVEL_HISTORY:
            return state;
        case CLEAR_NOVEL_HISTORY:
            return {
                ...state,
                history: state.history.filter(
                    (item) => item.novelId !== payload.novelId
                ),
            };
        // return {
        //     ...state,
        //     history: state.history.map((novel) =>
        //         novel.novelUrl === payload.novelUrl ? payload : novel
        //     ),
        // };
        default:
            return state;
    }
};

export default historyReducer;
