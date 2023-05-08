import { SAVE_SCROLL_POSITION } from '../preferences/preference.types';

export const saveScrollPosition =
  (offsetY, percentage, chapterId, novelId) => async dispatch => {
    dispatch({
      type: SAVE_SCROLL_POSITION,
      payload: {
        offsetY,
        percentage,
        chapterId,
        novelId,
      },
    });
  };
