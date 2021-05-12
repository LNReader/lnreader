import { GET_UPDATES } from "./updates.types";

import { getUpdates } from "../../Database/queries/UpdateQueries";
import { updateAllNovels } from "../../Services/updates";

import { showToast } from "../../Hooks/showToast";

export const getUpdatesAction = () => async (dispatch) => {
    const updates = await getUpdates();

    dispatch({ type: GET_UPDATES, payload: updates });
};

export const updateLibraryAction = () => async (dispatch) => {
    showToast("Updating library");

    await updateAllNovels();
    const updates = await getUpdates();

    dispatch({ type: GET_UPDATES, payload: updates });
};
