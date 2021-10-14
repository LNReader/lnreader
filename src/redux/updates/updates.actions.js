import {GET_UPDATES, SET_LAST_UPDATE_TIME} from './updates.types';

import {getUpdates} from '../../database/queries/UpdateQueries';
import {updateAllNovels} from '../../services/updates';

import {showToast} from '../../hooks/showToast';

export const getUpdatesAction = () => async dispatch => {
  const updates = await getUpdates();

  const groups = updates.reduce((grs, update) => {
    var dateParts = update.updateTime.split('-');
    var jsDate = new Date(
      dateParts[0],
      dateParts[1] - 1,
      dateParts[2].substr(0, 2),
    );
    const date = jsDate.toISOString();
    if (!grs[date]) {
      grs[date] = [];
    }
    grs[date].push(update);
    return grs;
  }, {});

  const groupedUpdates = Object.keys(groups).map(date => {
    return {
      date,
      data: groups[date],
    };
  });

  dispatch({type: GET_UPDATES, payload: groupedUpdates});
};

export const updateLibraryAction = () => async (dispatch, getState) => {
  showToast('Updating library');

  dispatch({type: SET_LAST_UPDATE_TIME, payload: Date.now()});

  const {downloadNewChapters = false, onlyUpdateOngoingNovels = false} =
    getState().settingsReducer;

  await updateAllNovels({downloadNewChapters, onlyUpdateOngoingNovels});

  dispatch(getUpdatesAction());
};
