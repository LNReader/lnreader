import { ToastAndroid } from "react-native";

import {
    LOADING_NOVEL,
    GET_NOVEL,
    GET_CHAPTERS,
    FETCHING_NOVEL,
    SET_NOVEL,
    UPDATE_IN_LIBRARY,
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
} from "./types";
import {
    checkNovelInDb,
    getChaptersFromDb,
    getNovelInfoFromDb,
    insertChaptersInDb,
    insertNovelInfoInDb,
    toggleFavourite,
    downloadChapterFromSource,
    deleteChapterFromDb,
} from "../../services/db";
import {
    fetchChaptersFromSource,
    fetchNovelFromSource,
} from "../../services/api";

export const setNovel = (novel) => async (dispatch) => {
    dispatch({ type: SET_NOVEL, payload: novel });
};

export const getNovel = (navigatingFrom, extensionId, novelUrl) => async (
    dispatch
) => {
    dispatch({ type: LOADING_NOVEL });

    if (navigatingFrom === 1) {
        const chapters = await getChaptersFromDb(novelUrl, "", "");
        dispatch({
            type: GET_CHAPTERS,
            payload: chapters,
        });
    } else {
        dispatch({ type: FETCHING_NOVEL });

        const inCache = await checkNovelInDb(novelUrl);

        if (inCache) {
            const novel = await getNovelInfoFromDb(novelUrl);
            const chapters = await getChaptersFromDb(novelUrl, "", "");

            dispatch({
                type: GET_NOVEL,
                payload: { novel, chapters },
            });
        } else {
            const novel = await fetchNovelFromSource(extensionId, novelUrl);
            const chapters = await fetchChaptersFromSource(
                extensionId,
                novelUrl
            );

            dispatch({
                type: GET_NOVEL,
                payload: { novel, chapters },
            });

            insertNovelInfoInDb(novel);
            insertChaptersInDb(novelUrl, chapters);
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

export const insertNovelInLibrary = (inLibrary, novelUrl) => async (
    dispatch
) => {
    toggleFavourite(inLibrary, novelUrl);

    dispatch({
        type: UPDATE_IN_LIBRARY,
        payload: !inLibrary,
    });

    ToastAndroid.show(
        !inLibrary ? "Added to library" : "Removed from library",
        ToastAndroid.SHORT
    );
};

// export const downloadChapter = (
//     extensionId,
//     novelUrl,
//     chapterUrl,
//     chapterName
// ) => async (dispatch) => {
//     dispatch({
//         type: CHAPTER_DOWNLOADING,
//         payload: {
//             extensionId,
//             novelUrl,
//             chapterUrl,
//         },
//     });

//     await downloadChapterFromSource(extensionId, novelUrl, chapterUrl);

//     dispatch({
//         type: CHAPTER_DOWNLOADED,
//         payload: { extensionId, novelUrl, chapterUrl },
//     });

//     ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
// };

// export const deleteChapter = (
//     extensionId,
//     novelUrl,
//     chapterUrl,
//     chapterName
// ) => (dispatch) => {
//     deleteChapterFromDb(extensionId, novelUrl, chapterUrl);

//     dispatch({
//         type: CHAPTER_DELETED,
//         payload: { extensionId, novelUrl, chapterUrl },
//     });

//     ToastAndroid.show(`Deleted ${chapterName}`, ToastAndroid.SHORT);
// };
