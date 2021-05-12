import { SET_CHAPTER_LIST_PREF, SET_LAST_READ } from "./preference.types";

const initialState = {
    novelSettings: {},
};

const novelReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_LAST_READ:
            return {
                ...state,
                novelSettings: {
                    ...state.novelSettings,
                    [payload.novelId]: {
                        ...state.novelSettings[payload.novelId],
                        lastRead: payload.chapterId,
                    },
                },
            };
        case SET_CHAPTER_LIST_PREF:
            return {
                ...state,
                novelSettings: {
                    ...state.novelSettings,
                    [payload.novelId]: {
                        ...state.novelSettings[payload.novelId],
                        sort: payload.sort,
                        filter: payload.filter,
                    },
                },
            };
        default:
            return state;
    }
};

export default novelReducer;
