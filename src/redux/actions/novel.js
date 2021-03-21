import { LOADING_NOVEL, GET_NOVEL, GET_CHAPTERS } from "./types";
import {
    checkNovelInDb,
    getChaptersFromDb,
    getNovelInfoFromDb,
    insertChaptersInDb,
    insertNovelInfoInDb,
} from "../../services/db";
import {
    fetchChaptersFromSource,
    fetchNovelFromSource,
} from "../../services/api";

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
