import { GET_UPDATES } from "./updates.types";

import { getUpdates } from "../../database/queries/UpdateQueries";

export const getUpdatesAction = () => async (dispatch) => {
    const updates = await getUpdates();

    dispatch({ type: GET_UPDATES, payload: updates });
};
