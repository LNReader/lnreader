import {
  SET_READER_SETTINGS,
  SET_APP_SETTINGS,
  SET_MULTIPLE_APP_SETTINGS,
} from './settings.types';

export const setAppSettings = (key, val) => dispatch => {
  dispatch({
    type: SET_APP_SETTINGS,
    payload: { key, val },
  });
};

export const setReaderSettings = (key, val) => dispatch => {
  dispatch({
    type: SET_READER_SETTINGS,
    payload: { key, val },
  });
};

export const setMultipleAppSettings = newSettings => dispatch => {
  dispatch({
    type: SET_MULTIPLE_APP_SETTINGS,
    payload: newSettings,
  });
};
