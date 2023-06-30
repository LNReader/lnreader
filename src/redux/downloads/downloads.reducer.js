import { CHAPTER_DOWNLOADED } from '../novel/novel.types';
import {
  CANCEL_DOWNLOAD,
  RESTORE_DOWNLOAD_STATE,
  SET_DOWNLOAD_QUEUE,
} from './donwloads.types';

const initialState = {
  downloadQueue: [], // Array<{id, url, isDownload, novelId, pluginId}>
};

const downloadsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_DOWNLOAD_QUEUE:
      return {
        ...state,
        downloadQueue: [...state.downloadQueue, ...payload],
      };

    case CHAPTER_DOWNLOADED:
      return {
        ...state,
        downloadQueue: state.downloadQueue.filter(
          chapter => chapter.id !== payload.chapterId,
        ),
      };
    case CANCEL_DOWNLOAD:
      return {
        ...state,
        downloadQueue: [],
      };
    case RESTORE_DOWNLOAD_STATE:
      return {
        ...payload,
      };
    default:
      return state;
  }
};

export default downloadsReducer;
