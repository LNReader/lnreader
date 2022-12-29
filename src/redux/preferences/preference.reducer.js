import {
  SET_NOVEL_CHAPTER_PREFIX,
  SET_NOVEL_CHAPTER_PREFIX_STYLE,
  SET_NOVEL_CHAPTER_TITLE_SEPERATOR,
  SET_NOVEL_SETTINGS,
} from '../novel/novel.types';
import {
  SAVE_SCROLL_POSITION,
  SET_CHAPTER_LIST_PREF,
  SET_LAST_READ,
} from './preference.types';

const initialState = {
  novelSettings: {},
};

const preferenceReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_LAST_READ:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.novelId]: {
            ...state.novelSettings[payload.novelId],
            lastRead: payload.chapterId,
          },
        },
      };
    case SET_CHAPTER_LIST_PREF:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.novelId]: {
            ...state.novelSettings[payload.novelId],
            sort: payload.sort,
            filter: payload.filter,
          },
        },
      };
    case SET_NOVEL_SETTINGS:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.novelId]: {
            ...state.novelSettings[payload.novelId],
            showGeneratedChapterTitle: payload.value,
          },
        },
      };
    case SET_NOVEL_CHAPTER_PREFIX:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.novelId]: {
            ...state.novelSettings[payload.novelId],
            showChapterPrefix: payload.prefix,
          },
        },
      };
    case SET_NOVEL_CHAPTER_PREFIX_STYLE:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.novelId]: {
            ...state.novelSettings[payload.novelId],
            chapterPrefixStyle: payload.prefixStyle,
          },
        },
      };
    case SET_NOVEL_CHAPTER_TITLE_SEPERATOR:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.novelId]: {
            ...state.novelSettings[payload.novelId],
            chapterTitleSeperator: payload.chapterTitleSeperator,
          },
        },
      };
    case SAVE_SCROLL_POSITION:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.novelId]: {
            ...state.novelSettings[payload.novelId],
            position: {
              ...state.novelSettings[payload.novelId].position,
              [payload.chapterId]: {
                position: payload.position,
                percentage: payload.percentage,
              },
            },
          },
        },
      };
    default:
      return state;
  }
};

export default preferenceReducer;
