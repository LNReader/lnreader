import { CHAPTER_DOWNLOADED } from "../novel/novel.types";
import { CANCEL_DOWNLOAD, SET_DOWNLOAD_QUEUE } from "./donwloads.types";

const initialState = {
    downloadQueue: [],
};

const downloadsReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_DOWNLOAD_QUEUE:
            return {
                ...state,
                downloadQueue: [...state.downloadQueue, ...payload],
            };

        case CHAPTER_DOWNLOADED:
            return {
                ...state,
                downloadQueue: state.downloadQueue.filter(
                    (chapter) => chapter.chapterId !== payload
                ),
            };
        case CANCEL_DOWNLOAD:
            return {
                ...state,
                downloadQueue: [],
            };
        default:
            return state;
    }
};

export default downloadsReducer;
