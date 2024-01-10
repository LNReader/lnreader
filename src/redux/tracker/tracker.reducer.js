import {
  REMOVE_TRACKER,
  SET_TRACKER,
  TRACK_NOVEL,
  UNTRACK_NOVEL,
  UPDATE_CHAPTERS_READ,
  UPDATE_TRACKER,
} from './tracker.types';

const initialState = {
  tracker: null,
  trackedNovels: [],
};

const trackerReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case TRACK_NOVEL:
      return {
        ...state,
        trackedNovels: state.trackedNovels.some(
          obj => obj.novelId === payload.novelId,
        )
          ? state.trackedNovels
          : [...state.trackedNovels, payload],
      };
    case UPDATE_TRACKER:
      return {
        ...state,
        trackedNovels: state.trackedNovels.map(novel =>
          novel.id === payload.trackerId
            ? {
                ...novel,
                userData: {
                  ...novel.userData,
                  progress: payload.progress,
                  status: payload.status,
                  score: payload.score,
                },
              }
            : novel,
        ),
      };
    case UNTRACK_NOVEL:
      return {
        ...state,
        trackedNovels: state.trackedNovels.filter(id => id === payload),
      };
    case UPDATE_CHAPTERS_READ:
      return {
        ...state,
        trackedNovels: state.trackedNovels.map(novel =>
          novel.id === payload.trackerId
            ? {
                ...novel,
                userData: {
                  ...novel.userData,
                  progress: payload.progress,
                },
              }
            : novel,
        ),
      };
    default:
      return state;
  }
};

export default trackerReducer;
