import {
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    GET_CHAPTERS,
    LOADING_NOVEL,
    GET_NOVEL,
    FETCHING_NOVEL,
    SET_NOVEL,
    UPDATE_IN_LIBRARY,
} from "../actions/types";

const initialState = {
    novel: null,
    chapters: [],
    loading: true,
    fetching: false,
};

const novelReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case LOADING_NOVEL:
            return { ...state, loading: true };
        case FETCHING_NOVEL:
            return { ...state, loading: true, fetching: true };
        case SET_NOVEL:
            return { ...state, novel: payload };
        case GET_NOVEL:
            return {
                ...state,
                novel: payload.novel,
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
                novel: { ...state.novel, libraryStatus: payload },
            };
        // case CHAPTER_DOWNLOADING:
        //     return {
        //         ...state,
        //         chapters: [
        //             state.chapters.map((chap) =>
        //                 chap.novelUrl === payload.novelUrl &&
        //                 chap.chapterUrl === payload.novelUrl
        //                     ? { ...chap, downloading: true, downloaded: false }
        //                     : chap
        //             ),
        //         ],
        //     };
        // case CHAPTER_DOWNLOADED:
        //     return {
        //         ...state,
        //         downloads: state.downloads.map((chap) =>
        //             chap.chapterUrl === payload.chapterUrl &&
        //             chap.novelUrl === payload.novelUrl
        //                 ? { ...chap, downloading: false, downloaded: true }
        //                 : chap
        //         ),
        //     };
        // case CHAPTER_DELETED:
        //     return {
        //         downloads: state.downloads.filter(
        //             (chapter) =>
        //                 chapter.chapterUrl === payload.chapterUrl &&
        //                 chapter.novelUrl === payload.novelUrl
        //         ),
        //     };
        default:
            return state;
    }
};

export default novelReducer;
