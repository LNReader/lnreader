import { ToastAndroid } from "react-native";

import {
    CHAPTER_READ,
    GET_CHAPTER,
    CHAPTER_LOADING,
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
} from "./chapter.types";

import { fetchChapter } from "../../source/Source";

import {
    markChapterRead,
    isChapterDownloaded,
    getChapter,
    downloadChapter,
    deleteChapter,
} from "../../database/queries/ChapterQueries";

export const getChapterAction = (
    extensionId,
    chapterUrl,
    novelUrl,
    novelId
) => async (dispatch) => {
    dispatch({ type: CHAPTER_LOADING });

    const isDownloaded = await isChapterDownloaded(novelId);
    let chapter;

    if (isDownloaded) {
        chapter = await getChapter(novelId);
    } else {
        chapter = await fetchChapter(extensionId, novelUrl, chapterUrl);
    }
    dispatch({ type: GET_CHAPTER, payload: chapter });
};

export const markChapterReadAction = (chapterId) => async (dispatch) => {
    await markChapterRead(chapterId);
    dispatch({ type: CHAPTER_READ, payload: { chapterId } });
};

export const downloadChapterAction = (
    extensionId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterId
) => async (dispatch) => {
    dispatch({
        type: CHAPTER_DOWNLOADING,
        payload: {
            chapterId,
        },
    });

    await downloadChapter(extensionId, novelUrl, chapterUrl, chapterId);

    dispatch({
        type: CHAPTER_DOWNLOADED,
        payload: { chapterId },
    });

    ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
};

export const deleteChapterAction = (chapterId, chapterName) => async (
    dispatch
) => {
    await deleteChapter(chapterId);

    dispatch({
        type: CHAPTER_DELETED,
        payload: { chapterId },
    });

    ToastAndroid.show(`Deleted ${chapterName}`, ToastAndroid.SHORT);
};
