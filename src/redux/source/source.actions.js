import {
  ENABLE_DISCOVER,
  FILTER_LANGUAGE,
  GET_SOURCES,
  PIN_SOURCES,
  SEARCH_SOURCES,
} from './source.types';
import {showToast} from '../../hooks/showToast';
import sources from '../../sources/sources.json';

export const getSourcesAction = () => async dispatch => {
  try {
    /**
     * Sort sources aplhabetically
     */
    let sortedSources = sources.sort((a, b) =>
      a.sourceName.localeCompare(b.sourceName),
    );

    dispatch({
      type: GET_SOURCES,
      payload: sortedSources,
    });
  } catch (error) {
    showToast(error.message);
  }
};

export const searchSourcesAction = searchText => async dispatch => {
  const res = searchText.toLowerCase();

  dispatch({
    type: SEARCH_SOURCES,
    payload: res,
  });
};

export const pinSourceAction = sourceId => async dispatch => {
  dispatch({
    type: PIN_SOURCES,
    payload: sourceId,
  });
};

export const filterLanguage = language => async dispatch => {
  dispatch({
    type: FILTER_LANGUAGE,
    payload: language,
  });
};

export const enableDiscover = key => async dispatch => {
  dispatch({
    type: ENABLE_DISCOVER,
    payload: key,
  });
};
