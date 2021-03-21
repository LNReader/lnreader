import {
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    GET_CHAPTERS,
    LOADING_NOVEL,
    GET_NOVEL,
} from "../actions/types";

const initialState = {
    novel: null,
    chapters: [],
    loading: true,
};

const novelReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case LOADING_NOVEL:
            return { ...state, loading: true };
        case GET_NOVEL:
            return {
                ...state,
                novel: payload.novel,
                chapters: payload.chapters,
                loading: false,
            };
        case GET_CHAPTERS:
            return {
                ...state,
                chapters: payload,
                loading: false,
            };
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

export default novelReducer;
