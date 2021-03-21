import {
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
} from "../actions/types";

const initialState = {
    chapters: [],
    loading: true,
};

const downloadsReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case CHAPTER_DOWNLOADING:
            return { ...state, downloads: [...state.downloads, payload] };
        case CHAPTER_DOWNLOADED:
            return {
                ...state,
                downloads: state.downloads.map((chapter) =>
                    chapter.chapterUrl === payload.chapterUrl &&
                    chapter.extensionId === payload.extensionId
                        ? { ...chapter, downloading: false, downloaded: true }
                        : chapter
                ),
            };
        case CHAPTER_DELETED:
            return {
                downloads: state.downloads.filter(
                    (chapter) =>
                        chapter.chapterUrl === payload.chapterUrl &&
                        chapter.extensionId === payload.extensionId
                ),
            };
        default:
            return state;
    }
};

export default downloadsReducer;
