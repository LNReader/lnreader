import {
  REMOVE_TRACKER,
  SET_TRACKER,
  TRACK_NOVEL,
  UNTRACK_NOVEL,
  UPDATE_TRACKER,
  UPDATE_CHAPTERS_READ,
} from './tracker.types';

import { getTracker } from '../../services/Trackers';

export const setTracker = (tracker, res) => async dispatch => {
  dispatch({
    type: SET_TRACKER,
    payload: { name: tracker, ...res },
  });
};

export const removeTracker = () => async dispatch => {
  dispatch({ type: REMOVE_TRACKER });
};

/**
 * @param {string} trackerName
 * @param {number} internalId
 * @param {import('../../services/Trackers').SearchResult} novel
 * @param {import('../../services/Trackers').AuthenticatorResult} authentication
 */
export const trackNovel =
  (trackerName, internalId, novel, auth) => async dispatch => {
    const tracker = getTracker(trackerName);
    const userData = await tracker.listFinder(novel.id, auth);
    dispatch({
      type: TRACK_NOVEL,
      payload: { novelId: internalId, ...novel, userData },
    });
  };

export const updateTracker =
  (trackerName, trackerId, auth, body) => async dispatch => {
    const tracker = getTracker(trackerName);
    const res = await tracker.listUpdater(trackerId, body, auth);
    dispatch({
      type: UPDATE_TRACKER,
      payload: { trackerId, ...res },
    });
  };

export const untrackNovel = id => async dispatch => {
  dispatch({ type: UNTRACK_NOVEL, payload: id });
};

export const updateChaptersRead =
  (trackerName, trackerId, auth, chaptersRead) => async dispatch => {
    const tracker = getTracker(trackerName);
    const res = await tracker.listUpdater(
      trackerId,
      { progress: chaptersRead },
      auth,
    );

    dispatch({
      type: UPDATE_CHAPTERS_READ,
      payload: { trackerId, progress: res.progress },
    });
  };
