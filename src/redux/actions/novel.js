import { ToastAndroid } from "react-native";

import {
    LOADING_NOVEL,
    GET_NOVEL,
    GET_CHAPTERS,
    FETCHING_NOVEL,
    SET_NOVEL,
    UPDATE_IN_LIBRARY,
    CHAPTER_READ,
    GET_CHAPTER,
    CHAPTER_LOADING,
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    UPDATE_NOVEL,
} from "./types";
import { getChaptersFromDb } from "../../services/db";
import { updateNovel } from "../../services/updates";
import { fetchChapter, fetchNovel } from "../../source/Source";
import {
    followNovel,
    insertNovel,
    checkNovelInCache,
    getNovel,
} from "../../database/queries/NovelQueries";
import {
    getChapters,
    insertChapters,
    markChapterRead,
    isChapterDownloaded,
    getChapter,
    downloadChapter,
    deleteChapter,
} from "../../database/queries/ChapterQueries";

export const setNovel = (novel) => async (dispatch) => {
    dispatch({ type: SET_NOVEL, payload: novel });
};

export const getNovelAction = (followed, sourceId, novelUrl, novelId) => async (
    dispatch
) => {
    dispatch({ type: LOADING_NOVEL });

    if (followed === 1) {
        const chapters = await getChapters(novelId);

        dispatch({
            type: GET_CHAPTERS,
            payload: chapters,
        });
    } else {
        dispatch({ type: FETCHING_NOVEL });

        const inCache = await checkNovelInCache(novelUrl);

        if (inCache) {
            const novel = await getNovel(novelUrl);
            novel.chapters = await getChapters(novel.novelId);

            dispatch({
                type: GET_NOVEL,
                payload: novel,
            });
        } else {
            /**
             * Fetch novel from source
             */
            const fetchedNovel = await fetchNovel(sourceId, novelUrl);

            /**
             * Insert novel in db
             */
            const fetchedNovelId = await insertNovel(fetchedNovel);
            await insertChapters(fetchedNovelId, fetchedNovel.chapters);

            /**
             * Get Novel  from db
             */
            const novel = await getNovel(novelUrl);
            novel.chapters = await getChapters(novel.novelId);

            dispatch({
                type: GET_NOVEL,
                payload: novel,
            });
        }
    }
};

export const sortAndFilterChapters = (novelUrl, filter, sort) => async (
    dispatch
) => {
    const chapters = await getChaptersFromDb(novelUrl, filter, sort);
    dispatch({
        type: GET_CHAPTERS,
        payload: chapters,
    });
};

export const followNovelAction = (followed, novelId) => async (dispatch) => {
    await followNovel(followed, novelId);

    dispatch({
        type: UPDATE_IN_LIBRARY,
        payload: !followed,
    });

    ToastAndroid.show(
        !followed ? "Added to library" : "Removed from library",
        ToastAndroid.SHORT
    );
};

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

export const updateLibraryNovel = (extensionId, novelUrl) => async (
    dispatch
) => {
    dispatch({ type: FETCHING_NOVEL });

    const updatedNovel = await updateNovel(extensionId, novelUrl);

    dispatch({
        type: UPDATE_NOVEL,
        payload: { novel: updatedNovel, chapters: updatedNovel.novelChapters },
    });
};
