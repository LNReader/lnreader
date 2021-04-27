import {
    REMOVE_TRACKER,
    SET_TRACKER,
    TRACK_NOVEL,
    UNTRACK_NOVEL,
} from "./tracker.types";

const initialState = {
    tracker: null,
    trackedNovels: [],
};

const trackerReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_TRACKER:
            return {
                ...state,
                tracker: { ...payload, name: "MyAnimeList" },
            };
        case REMOVE_TRACKER:
            return {
                ...state,
                tracker: null,
            };
        case TRACK_NOVEL:
            // console.log(payload);
            return {
                ...state,
                trackedNovels: [...state.trackedNovels, payload],
            };

        case UNTRACK_NOVEL:
            return {
                ...state,
                trackedNovels: state.trackedNovels.filter(
                    (id) => id === payload
                ),
            };
        default:
            return state;
    }
};

export default trackerReducer;
