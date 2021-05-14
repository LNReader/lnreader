import { ToastAndroid } from "react-native";

import {
    LOADING_NOVEL,
    GET_NOVEL,
    GET_CHAPTERS,
    FETCHING_NOVEL,
    SET_NOVEL,
    UPDATE_IN_LIBRARY,
    CHAPTER_READ,
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    UPDATE_NOVEL,
    SET_NOVEL_SETTINGS,
    CHAPTER_UNREAD,
    BOOKMARK_CHAPTER,
    MARK_PREVIOUS_CHAPTERS_READ,
    MARK_PREVIOUS_CHAPTERS_UNREAD,
} from "./novel.types";

import { updateNovel } from "../../Services/updates";
import { fetchNovel } from "../../Services/Source/source";
import {
    followNovel,
    insertNovel,
    getNovel,
} from "../../Database/queries/NovelQueries";
import {
    getChapters,
    insertChapters,
    markChapterRead,
    downloadChapter,
    deleteChapter,
    markChapterUnread,
    bookmarkChapter,
    markPreviuschaptersRead,
    markPreviousChaptersUnread,
} from "../../Database/queries/ChapterQueries";
import { deleteNovelUpdates } from "../../Database/queries/UpdateQueries";
import {
    SET_CHAPTER_LIST_PREF,
    SET_LAST_READ,
} from "../preferences/preference.types";
import { GET_LIBRARY_NOVELS } from "../library/library.types";
import { getLibrary } from "../../Database/queries/LibraryQueries";
import { showToast } from "../../Hooks/showToast";

export const setNovel = (novel) => async (dispatch) => {
    dispatch({ type: SET_NOVEL, payload: novel });
};

export const getNovelAction =
    (followed, sourceId, novelUrl, novelId, sort, filter) =>
    async (dispatch) => {
        dispatch({ type: LOADING_NOVEL });

        if (followed === 1) {
            /**
             * If novel is followed directly get the chapters from db.
             */
            const chapters = await getChapters(novelId, sort, filter);

            dispatch({
                type: GET_CHAPTERS,
                payload: chapters,
            });
        } else {
            dispatch({ type: FETCHING_NOVEL });

            /**
             * Check if novel is cached.
             */
            const novel = await getNovel(sourceId, novelUrl);

            if (novel) {
                /**
                 * Get chapters from db.
                 */
                novel.chapters = await getChapters(novel.novelId, sort, filter);
                dispatch({
                    type: GET_NOVEL,
                    payload: novel,
                });
            } else {
                /**
                 * Fetch novel from source.
                 */
                const fetchedNovel = await fetchNovel(sourceId, novelUrl);

                /**
                 * Insert novel in db.
                 */
                const fetchedNovelId = await insertNovel(fetchedNovel);
                await insertChapters(fetchedNovelId, fetchedNovel.chapters);

                /**
                 * Get novel from db.
                 */
                const novel = await getNovel(sourceId, novelUrl);
                novel.chapters = await getChapters(novel.novelId);

                dispatch({
                    type: GET_NOVEL,
                    payload: novel,
                });
            }
        }
    };

export const sortAndFilterChapters =
    (novelId, sort, filter) => async (dispatch) => {
        const chapters = await getChapters(novelId, sort, filter);

        dispatch({
            type: GET_CHAPTERS,
            payload: chapters,
        });

        dispatch({
            type: SET_CHAPTER_LIST_PREF,
            payload: { novelId, sort, filter },
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

    const res = await getLibrary();

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });

    showToast(!novel.followed ? "Added to library" : "Removed from library");
};

export const bookmarkChapterAction =
    (bookmark, chapterId) => async (dispatch) => {
        await bookmarkChapter(bookmark, chapterId);

        dispatch({
            type: BOOKMARK_CHAPTER,
            payload: { bookmark, chapterId },
        });
    };

export const markChapterReadAction =
    (chapterId, novelId) => async (dispatch) => {
        await markChapterRead(chapterId);
        dispatch({ type: CHAPTER_READ, payload: { chapterId } });
        dispatch({
            type: SET_LAST_READ,
            payload: { novelId, chapterId: chapterId + 1 },
        });
    };

export const markPreviousChaptersReadAction =
    (chapterId, novelId) => async (dispatch) => {
        await markPreviuschaptersRead(chapterId, novelId);

        dispatch({ type: MARK_PREVIOUS_CHAPTERS_READ, payload: chapterId });
    };

export const markPreviousChaptersUnreadAction =
    (chapterId, novelId) => async (dispatch) => {
        await markPreviousChaptersUnread(chapterId, novelId);

        dispatch({ type: MARK_PREVIOUS_CHAPTERS_UNREAD, payload: chapterId });
    };

export const markChapterUnreadAction = (chapterId) => async (dispatch) => {
    await markChapterUnread(chapterId);

    dispatch({ type: CHAPTER_UNREAD, payload: { chapterId } });
};

export const downloadChapterAction =
    (extensionId, novelUrl, chapterUrl, chapterName, chapterId) =>
    async (dispatch) => {
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

export const downloadAllChaptersAction =
    (extensionId, novelUrl, chapters) => async (dispatch) => {
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

        showToast(`All chapters downloaded`);
    };

export const deleteChapterAction =
    (chapterId, chapterName) => async (dispatch) => {
        await deleteChapter(chapterId);

        dispatch({
            type: CHAPTER_DELETED,
            payload: chapterId,
        });

        showToast(`Deleted ${chapterName}`);
    };

export const deleteAllChaptersAction = (chapters) => async (dispatch) => {
    await chapters.map((chapter) => {
        deleteChapter(chapter.chapterId);

        dispatch({
            type: CHAPTER_DELETED,
            payload: chapter.chapterId,
        });
    });

    showToast("Deleted all chapters");
};

export const updateNovelAction =
    (sourceId, novelUrl, novelId, sort, filter) => async (dispatch) => {
        dispatch({ type: FETCHING_NOVEL });

        await updateNovel(sourceId, novelUrl, novelId);

        let novel = await getNovel(sourceId, novelUrl);
        let chapters = await getChapters(novel.novelId, sort, filter);

        dispatch({
            type: UPDATE_NOVEL,
            payload: { novel, chapters },
        });
    };
