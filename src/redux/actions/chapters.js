import {
    LOADING_CHAPTERS,
    GET_CHAPTERS,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    CHAPTER_DOWNLOADING,
} from "./types";

import {
    deleteChapterFromDb,
    downloadChapterFromSource,
} from "../../services/db";

import { ToastAndroid } from "react-native";

export const downloadChapter = (
    extensionId,
    novelUrl,
    chapterUrl,
    chapterName
) => async (dispatch) => {
    dispatch({
        type: CHAPTER_DOWNLOADING,
        payload: {
            extensionId,
            novelUrl,
            chapterUrl,
            downloading: true,
            downloaded: false,
        },
    });

    await downloadChapterFromSource(extensionId, novelUrl, chapterUrl);

    dispatch({
        type: CHAPTER_DOWNLOADED,
        payload: { extensionId, novelUrl, chapterUrl },
    });

    ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
};

export const deleteChapter = (
    extensionId,
    novelUrl,
    chapterUrl,
    chapterName
) => (dispatch) => {
    deleteChapterFromDb(extensionId, novelUrl, chapterUrl);

    dispatch({
        type: CHAPTER_DELETED,
        payload: { extensionId, novelUrl, chapterUrl },
    });

    ToastAndroid.show(`Deleted ${chapterName}`, ToastAndroid.SHORT);
};
