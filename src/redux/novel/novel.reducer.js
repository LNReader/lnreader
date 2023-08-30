import {
  CHAPTER_DOWNLOADING,
  CHAPTER_DOWNLOADED,
  CHAPTER_DELETED,
  ALL_CHAPTER_DELETED,
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
} from './novel.types';

const initialState = {
  novel: {},
  chapters: [],
  loading: true,
  updating: false,
  downloading: [],
};

const novelReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOADING_NOVEL:
      return { ...state, loading: true };
    case FETCHING_NOVEL:
      return { ...state, updating: true };
    case SET_NOVEL:
      return { ...state, novel: payload };
    case GET_NOVEL:
      return {
        ...state,
        novel: payload,
        chapters: payload.chapters,
        loading: false,
        updating: false,
      };
    case GET_CHAPTERS:
      return {
        ...state,
        chapters: payload,
        loading: false,
        updating: false,
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
        updating: false,
      };
    case CHAPTER_READ:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.chapterId === payload.chapterId
            ? { ...chapter, read: 1 }
            : chapter,
        ),
      };
    case CHAPTER_UNREAD:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.chapterId === payload.chapterId
            ? { ...chapter, read: 0 }
            : chapter,
        ),
      };
    case BOOKMARK_CHAPTER:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.chapterId === payload.chapterId
            ? { ...chapter, bookmark: !payload.bookmark }
            : chapter,
        ),
      };
    case CHAPTER_DOWNLOADING:
      return {
        ...state,
        downloading: [...state.downloading, payload],
      };
    case CHAPTER_DOWNLOADED:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.chapterId === payload
            ? { ...chapter, downloaded: 1 }
            : chapter,
        ),
        downloading: state.downloading.filter(
          chapterId => chapterId !== payload,
        ),
      };
    case CHAPTER_DELETED:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.chapterId === payload
            ? { ...chapter, downloaded: 0 }
            : chapter,
        ),
      };
    case ALL_CHAPTER_DELETED:
      return {
        ...state,
        chapters: state.chapters.map(chapter => ({
          ...chapter,
          downloaded: 0,
        })),
      };
    case UPDATE_LAST_READ:
      return {
        ...state,
        novel: { ...state.novel, lastRead: payload },
      };

    case MARK_PREVIOUS_CHAPTERS_READ:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.chapterId < payload ? { ...chapter, read: 1 } : chapter,
        ),
      };
    case MARK_PREVIOUS_CHAPTERS_UNREAD:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.chapterId < payload ? { ...chapter, read: 0 } : chapter,
        ),
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
