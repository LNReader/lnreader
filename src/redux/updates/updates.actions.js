import { SET_LAST_UPDATE_TIME } from './updates.types';

import { showToast } from '../../hooks/showToast';
import { updateLibrary } from '../../services/updates/updates';

export const updateLibraryAction = props => async (dispatch, getState) => {
  showToast('Updating library');

  dispatch({ type: SET_LAST_UPDATE_TIME, payload: Date.now() });

  const {
    downloadNewChapters = false,
    onlyUpdateOngoingNovels = false,
    refreshNovelMetadata = false,
  } = getState().settingsReducer;

  const categoryId = props?.categoryId;

  await updateLibrary({
    downloadNewChapters,
    onlyUpdateOngoingNovels,
    refreshNovelMetadata,
    categoryId,
  });
};
