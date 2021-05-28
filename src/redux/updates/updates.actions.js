import { GET_UPDATES } from "./updates.types";

import { getUpdates } from "../../Database/queries/UpdateQueries";
import { updateAllNovels } from "../../Services/updates";

import { showToast } from "../../Hooks/showToast";

export const getUpdatesAction = () => async (dispatch) => {
    const updates = await getUpdates();

    const groups = updates.reduce((groups, update) => {
        var dateParts = update.updateTime.split("-");
        var jsDate = new Date(
            dateParts[0],
            dateParts[1] - 1,
            dateParts[2].substr(0, 2)
        );
        const date = jsDate.toISOString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(update);
        return groups;
    }, {});

    const groupedUpdates = Object.keys(groups).map((date) => {
        return {
            date,
            chapters: groups[date],
        };
    });

    dispatch({ type: GET_UPDATES, payload: groupedUpdates });
};

export const updateLibraryAction = () => async (dispatch) => {
    showToast("Updating library");

    await updateAllNovels();

    dispatch(getUpdatesAction());
};
