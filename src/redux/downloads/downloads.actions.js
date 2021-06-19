import { SET_DOWNLOAD_QUEUE, CANCEL_DOWNLOAD } from "./donwloads.types";
import BackgroundService from "react-native-background-actions";

export const cancelDownload = () => async (dispatch) => {
    await BackgroundService.stop();

    dispatch({ type: CANCEL_DOWNLOAD });
};
