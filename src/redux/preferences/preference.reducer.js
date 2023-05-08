import { SET_NOVEL_SETTINGS } from '../novel/novel.types';
import {
  SAVE_SCROLL_POSITION,
  SET_CHAPTER_LIST_PREF,
  SET_LAST_READ,
} from './preference.types';

const initialState = {
  novelSettings: {}, // {[novelId]: {lastRead, sort, filter, showChapterTitles, position {[chapterId]: position, percentage}}}
};

const preferenceReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_LAST_READ:
      return {
        ...state,
        novelSettings: {
          ...state.novelSettings,
          [payload.lastRead.novelId]: {
            ...state.novelSettings[payload.lastRead.novelId],
            lastRead: payload.lastRead,
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
            showChapterTitles: payload.showChapterTitles,
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
                offsetY: payload.offsetY,
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
