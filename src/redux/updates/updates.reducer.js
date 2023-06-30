import {
  LOAD_UPDATES,
  GET_UPDATES,
  SET_LAST_UPDATE_TIME,
  SHOW_LAST_UPDATE_TIME,
  RESTORE_UPDATE_STATE,
} from './updates.types';

const initialState = {
  updates: [],
  lastUpdateTime: null,
  showLastUpdateTime: true,
  loading: true,
};

const updateReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOAD_UPDATES:
      return { ...state, loading: true };
    case GET_UPDATES:
      return { ...state, updates: payload, loading: false };
    case SET_LAST_UPDATE_TIME:
      return {
        ...state,
        lastUpdateTime: payload,
      };
    case SHOW_LAST_UPDATE_TIME:
      return {
        ...state,
        showLastUpdateTime: payload,
      };
    case RESTORE_UPDATE_STATE:
      return {
        ...payload,
      };
    default:
      return state;
  }
};

export default updateReducer;
