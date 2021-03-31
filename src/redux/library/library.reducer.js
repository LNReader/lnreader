import { FOLLOW_NOVEL, UNFOLLOW_NOVEL } from "../novel/novel.types";
import { GET_LIBRARY_NOVELS } from "./library.types";

const initialState = {
    novels: [],
    loading: true,
};

const libraryReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case GET_LIBRARY_NOVELS:
            return { novels: payload, loading: false };
        case FOLLOW_NOVEL:
            return {
                ...state,
                novels: [...state.novels, { ...payload, followed: 1 }],
            };
        case UNFOLLOW_NOVEL:
            return {
                ...state,
                novels: state.novels.filter(
                    (novel) => novel.novelId !== payload
                ),
            };
        default:
            return state;
    }
};

export default libraryReducer;
