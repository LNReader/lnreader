import {
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    GET_CHAPTERS,
    LOADING_NOVEL,
    GET_NOVEL,
    GET_CHAPTER,
    FETCHING_NOVEL,
    SET_NOVEL,
    UPDATE_IN_LIBRARY,
    CHAPTER_READ,
    CHAPTER_LOADING,
    UPDATE_NOVEL,
    UPDATE_LAST_READ,
} from "./novel.types";

const initialState = {
    novel: null,
    chapters: [],
    chapter: null,
    downloading: [],
    chapterLoading: true,
    loading: true,
    fetching: false,
};

const novelReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case LOADING_NOVEL:
            return { ...state, loading: true };
        case FETCHING_NOVEL:
            return { ...state, fetching: true };
        case SET_NOVEL:
            return { ...state, novel: payload };
        case GET_NOVEL:
            return {
                ...state,
                novel: payload,
                chapters: payload.chapters,
                loading: false,
                fetching: false,
            };
        case GET_CHAPTERS:
            return {
                ...state,
                chapters: payload,
                loading: false,
                fetching: false,
            };
        case UPDATE_IN_LIBRARY:
            return {
                ...state,
                novel: { ...state.novel, followed: payload.followed },
            };
        case UPDATE_NOVEL:
            return {
                ...state,
                novel: payload.novel,
                chapters: payload.chapters,
                loading: false,
                fetching: false,
            };
        case CHAPTER_READ:
            return {
                ...state,
                chapters: state.chapters.map((chapter) =>
                    chapter.chapterId === payload.chapterId
                        ? { ...chapter, read: 1 }
                        : chapter
                ),
            };
        case CHAPTER_LOADING:
            return {
                ...state,
                chapterLoading: true,
            };
        case GET_CHAPTER:
            return { ...state, chapter: payload, chapterLoading: false };
        case CHAPTER_DOWNLOADING:
            return {
                ...state,
                chapters: state.chapters.map((chapter) =>
                    chapter.chapterId === payload
                        ? { ...chapter, downloaded: 3 }
                        : chapter
                ),
            };
        case CHAPTER_DOWNLOADED:
            return {
                ...state,
                chapters: state.chapters.map((chapter) =>
                    chapter.chapterId === payload
                        ? { ...chapter, downloaded: 1 }
                        : chapter
                ),
            };
        case CHAPTER_DELETED:
            return {
                ...state,
                chapters: state.chapters.map((chapter) =>
                    chapter.chapterId === payload
                        ? { ...chapter, downloaded: 0 }
                        : chapter
                ),
            };
        case UPDATE_LAST_READ:
            return {
                ...state,
                novel: { ...state.novel, lastRead: payload },
            };
        default:
            return state;
    }
};

export default novelReducer;
