import {
    CHAPTER_READ,
    GET_CHAPTER,
    CHAPTER_LOADING,
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
} from "./chapter.types";

const initialState = {
    chapter: null,
    downloading: [],
    loading: true,
};

const chapterReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
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

export default chapterReducer;
