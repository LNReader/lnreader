import { CHAPTER_LOADING, GET_CHAPTER } from "./chapter.types";

const initialState = {
    chapter: {},
    loading: true,
};

const chapterReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case CHAPTER_LOADING:
            return { ...state, loading: true };
        case GET_CHAPTER:
            return { ...state, chapter: payload, loading: false };
        default:
            return state;
    }
};

export default chapterReducer;
