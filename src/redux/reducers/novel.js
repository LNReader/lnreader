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
} from "../actions/types";

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
                novel: { ...state.novel, followed: payload },
            };
        case UPDATE_NOVEL:
            return {
                ...state,
                novel: {
                    ...state.novel,
                    novelName: payload.novel.novelName,
                    novelUrl: payload.novel.novelUrl,
                    novelSummary: payload.novel.novelSummary,
                    author: payload.novel.author,
                    artist: payload.novel.artist,
                    genre: payload.novel.genre,
                    status: payload.novel.status,
                },
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
                downloading: payload.chapterId,
            };
        case CHAPTER_DOWNLOADED:
            return {
                ...state,
                downloading: null,
                chapters: state.chapters.map((chapter) =>
                    chapter.chapterId === payload.chapterId
                        ? { ...chapter, downloaded: 1 }
                        : chapter
                ),
            };
        case CHAPTER_DELETED:
            return {
                ...state,
                chapters: state.chapters.map((chapter) =>
                    chapter.chapterId === payload.chapterId
                        ? { ...chapter, downloaded: 0 }
                        : chapter
                ),
            };
        default:
            return state;
    }
};

export default novelReducer;
