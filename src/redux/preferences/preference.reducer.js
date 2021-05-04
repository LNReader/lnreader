import { SET_CHAPTER_LIST_PREF, SET_LAST_READ } from "./preference.types";

const initialState = {
    novelSettings: [],
};

const novelReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_LAST_READ:
            return {
                ...state,
                novelSettings: !state.novelSettings.some(
                    (novel) => novel.novelId === payload.novelId
                )
                    ? [
                          {
                              novelId: payload.novelId,
                              lastRead: payload.chapterId,
                          },
                      ]
                    : state.novelSettings.map((novel) =>
                          novel.novelId === payload.novelId
                              ? { ...novel, lastRead: payload.chapterId }
                              : novel
                      ),
            };
        case SET_CHAPTER_LIST_PREF:
            return {
                ...state,
                novelSettings: state.novelSettings.some(
                    (novel) => novel.novelId === payload.novelId
                )
                    ? state.novelSettings.map((novel) =>
                          novel.novelId === payload.novelId
                              ? {
                                    ...novel,
                                    sort: payload.sort,
                                    filter: payload.filter,
                                }
                              : novel
                      )
                    : [
                          ...state.novelSettings,
                          {
                              novelId: payload.novelId,
                              sort: payload.sort,
                              filter: payload.filter,
                          },
                      ],
            };
        default:
            return state;
    }
};

export default novelReducer;
