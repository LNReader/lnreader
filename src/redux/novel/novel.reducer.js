import {
  CHAPTER_DOWNLOADING,
  CHAPTER_DOWNLOADED,
  ALL_CHAPTER_DELETED,
  CHAPTER_DELETED,
  GET_CHAPTERS,
  LOADING_NOVEL,
  GET_NOVEL,
  FETCHING_NOVEL,
  SET_NOVEL,
  UPDATE_IN_LIBRARY,
  NOVEL_ERROR,
  CHAPTER_READ,
  UPDATE_NOVEL,
  UPDATE_LAST_READ,
  CHAPTER_UNREAD,
  BOOKMARK_CHAPTER,
  MARK_PREVIOUS_CHAPTERS_READ,
  MARK_PREVIOUS_CHAPTERS_UNREAD,
  RESTORE_NOVEL_STATE,
} from './novel.types';

const initialState = {
  novel: {},
  chapters: [],
  loading: true,
  updating: false,
  downloading: [], // Array<ChapterInfo {id, url, isDownloaded, novelId, pluginId}>
  lastRead: undefined, // ChapterInfo (id, name,)
  inLibrary: false,
};

const novelReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOADING_NOVEL:
      return { ...state, loading: true };
    case FETCHING_NOVEL:
      return { ...state, updating: true };
    case SET_NOVEL:
      return { ...state, novel: payload.novel };
    case GET_NOVEL:
      return {
        ...state,
        novel: payload.novel,
        chapters: payload.chapters,
        loading: false,
        updating: false,
      };
    case GET_CHAPTERS:
      return {
        ...state,
        chapters: payload.chapters,
        loading: false,
        updating: false,
      };
    case UPDATE_IN_LIBRARY:
      return {
        ...state,
        novel: { ...state.novel, inLibrary: payload.inLibrary },
      };
    case UPDATE_NOVEL:
      return {
        ...state,
        novel: payload.novel,
        chapters: payload.chapters,
        loading: false,
        updating: false,
      };
    case CHAPTER_READ:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, unread: 0 }
            : chapter,
        ),
      };
    case CHAPTER_UNREAD:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, unread: 1 }
            : chapter,
        ),
      };
    case BOOKMARK_CHAPTER:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, bookmark: !payload.bookmark }
            : chapter,
        ),
      };
    case CHAPTER_DOWNLOADING:
      return {
        ...state,
        downloading: [...state.downloading, payload.downloadingChapter],
      };
    case CHAPTER_DOWNLOADED:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, idDownloaded: 1 }
            : chapter,
        ),
        downloading: state.downloading.filter(
          chapter => chapter.id !== payload.chapterId,
        ),
      };
    case CHAPTER_DELETED:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, isDownloaded: 0 }
            : chapter,
        ),
      };
    case ALL_CHAPTER_DELETED:
      return {
        ...state,
        chapters: state.chapters.map(chapter => ({
          ...chapter,
          isDownloaded: 0,
        })),
      };
    case UPDATE_LAST_READ:
      return {
        ...state,
        novel: { ...state.novel, lastRead: payload.lastRead },
      };

    case MARK_PREVIOUS_CHAPTERS_READ:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id < payload.chapterId ? { ...chapter, unread: 0 } : chapter,
        ),
      };
    case MARK_PREVIOUS_CHAPTERS_UNREAD:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id < payload.chapterId ? { ...chapter, unread: 1 } : chapter,
        ),
      };
    case RESTORE_NOVEL_STATE:
      return {
        ...payload,
      };
    case NOVEL_ERROR:
      return {
        ...state,
        novel: {},
        chapters: [],
        loading: false,
        updating: false,
      };
    default:
      return state;
  }
};

export default novelReducer;
