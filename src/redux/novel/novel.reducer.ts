import { ChapterInfo, NovelInfo } from '@database/types';
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
  CHAPTER_UNREAD,
  BOOKMARK_CHAPTER,
  MARK_PREVIOUS_CHAPTERS_READ,
  MARK_PREVIOUS_CHAPTERS_UNREAD,
  RESTORE_NOVEL_STATE,
} from './novel.types';

export interface NovelState {
  novel: NovelInfo;
  chapters: ChapterInfo[];
  loading: boolean;
  updating: boolean;
  downloading: any[]; // Array<ChapterInfo {id, url, isDownloaded, novelId, pluginId}>
  lastRead: ChapterInfo;
  inLibrary: boolean;
}

const initialState: NovelState = {
  novel: {} as NovelInfo,
  chapters: [],
  loading: true,
  updating: false,
  downloading: [],
  lastRead: {} as ChapterInfo,
  inLibrary: false,
};

const novelReducer = (state = initialState, action: any): NovelState => {
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
            ? { ...chapter, unread: false }
            : chapter,
        ),
      };
    case CHAPTER_UNREAD:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, unread: true }
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
        downloading: state.downloading.filter(
          chapter => chapter.id !== payload.chapterId,
        ),
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, isDownloaded: true }
            : chapter,
        ),
      };
    case CHAPTER_DELETED:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id === payload.chapterId
            ? { ...chapter, isDownloaded: false }
            : chapter,
        ),
      };
    case ALL_CHAPTER_DELETED:
      return {
        ...state,
        chapters: state.chapters.map(chapter => ({
          ...chapter,
          isDownloaded: false,
        })),
      };

    case MARK_PREVIOUS_CHAPTERS_READ:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id < payload.chapterId
            ? { ...chapter, unread: false }
            : chapter,
        ),
      };
    case MARK_PREVIOUS_CHAPTERS_UNREAD:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter.id < payload.chapterId
            ? { ...chapter, unread: true }
            : chapter,
        ),
      };
    case RESTORE_NOVEL_STATE:
      return {
        ...payload,
      };
    case NOVEL_ERROR:
      return {
        ...state,
        novel: {} as NovelInfo,
        chapters: [],
        loading: false,
        updating: false,
      };
    default:
      return state;
  }
};

export default novelReducer;
