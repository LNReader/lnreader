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
    SET_NOVEL_SETTINGS,
} from "./novel.types";

import { updateNovel } from "../../Services/updates";
import { fetchChapter, fetchNovel } from "../../Services/Source/source";
import {
    followNovel,
    insertNovel,
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
import { deleteNovelUpdates } from "../../database/queries/UpdateQueries";

export const setNovel = (novel) => async (dispatch) => {
    dispatch({ type: SET_NOVEL, payload: novel });
};

export const getNovelAction = (
    followed,
    sourceId,
    novelUrl,
    novelId,
    sort,
    filter
) => async (dispatch) => {
    dispatch({ type: LOADING_NOVEL });

    if (followed === 1) {
        const chapters = await getChapters(novelId, sort, filter);

        dispatch({
            type: GET_CHAPTERS,
            payload: chapters,
        });
    } else {
        dispatch({ type: FETCHING_NOVEL });

        const novel = await getNovel(novelUrl);

        if (novel) {
            novel.chapters = await getChapters(novel.novelId, sort, filter);
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

export const sortAndFilterChapters = (novelId, sort, filter) => async (
    dispatch
) => {
    const chapters = await getChapters(novelId, sort, filter);

    dispatch({
        type: SET_NOVEL_SETTINGS,
        payload: { chapters, novelId, sort, filter },
    });
};

export const followNovelAction = (novel) => async (dispatch) => {
    await followNovel(novel.followed, novel.novelId);

    if (!novel.followNovel) {
        deleteNovelUpdates(novel.novelId);
    }

    dispatch({
        type: UPDATE_IN_LIBRARY,
        payload: { novelUrl: novel.novelUrl, followed: !novel.followed },
    });

    ToastAndroid.show(
        !novel.followed ? "Added to library" : "Removed from library",
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
        payload: chapterId,
    });

    await downloadChapter(extensionId, novelUrl, chapterUrl, chapterId);

    dispatch({
        type: CHAPTER_DOWNLOADED,
        payload: chapterId,
    });

    ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
};

export const downloadAllChaptersAction = (
    extensionId,
    novelUrl,
    chapters
) => async (dispatch) => {
    await chapters.map((chapter, index) => {
        setTimeout(async () => {
            dispatch({
                type: CHAPTER_DOWNLOADING,
                payload: chapter.chapterId,
            });

            if (!chapter.downloaded) {
                await downloadChapter(
                    extensionId,
                    novelUrl,
                    chapter.chapterUrl,
                    chapter.chapterId
                );
            }

            dispatch({
                type: CHAPTER_DOWNLOADED,
                payload: chapter.chapterId,
            });
        }, 1000 * index);
    });

    ToastAndroid.show(`All chapters downloaded`, ToastAndroid.SHORT);
};

export const deleteChapterAction = (chapterId, chapterName) => async (
    dispatch
) => {
    await deleteChapter(chapterId);

    dispatch({
        type: CHAPTER_DELETED,
        payload: chapterId,
    });

    ToastAndroid.show(`Deleted ${chapterName}`, ToastAndroid.SHORT);
};

export const deleteAllChaptersAction = (chapters) => async (dispatch) => {
    await chapters.map((chapter) => {
        deleteChapter(chapter.chapterId);

        dispatch({
            type: CHAPTER_DELETED,
            payload: chapter.chapterId,
        });
    });

    ToastAndroid.show(`Deleted all chapters`, ToastAndroid.SHORT);
};

export const updateNovelAction = (extensionId, novelUrl, novelId) => async (
    dispatch
) => {
    dispatch({ type: FETCHING_NOVEL });

    await updateNovel(extensionId, novelUrl, novelId);

    let novel = await getNovel(novelUrl);
    let chapters = await getChapters(novel.novelId);

    dispatch({
        type: UPDATE_NOVEL,
        payload: { novel, chapters },
    });
};
