import { ToastAndroid } from 'react-native';

import {
  LOADING_NOVEL,
  GET_NOVEL,
  GET_CHAPTERS,
  FETCHING_NOVEL,
  SET_NOVEL,
  UPDATE_IN_LIBRARY,
  CHAPTER_READ,
  CHAPTER_DOWNLOADED,
  CHAPTER_DELETED,
  UPDATE_NOVEL,
  SET_NOVEL_SETTINGS,
  BOOKMARK_CHAPTER,
  MARK_PREVIOUS_CHAPTERS_READ,
  MARK_PREVIOUS_CHAPTERS_UNREAD,
} from './novel.types';

import { fetchNovel } from '../../services/Source/source';
import {
  followNovel,
  insertNovel,
  getNovel,
} from '../../database/queries/NovelQueries';
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
  getNextChapter,
} from '../../database/queries/ChapterQueries';
import { deleteUpdateFromDb } from '../../database/queries/UpdateQueries';
import {
  SAVE_SCROLL_POSITION,
  SET_CHAPTER_LIST_PREF,
  SET_LAST_READ,
} from '../preferences/preference.types';
import { showToast } from '../../hooks/showToast';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

import BackgroundService from 'react-native-background-actions';
import { SET_DOWNLOAD_QUEUE } from '../downloads/donwloads.types';
import { updateNovel } from '../../services/updates/LibraryUpdateQueries';

export const setNovel = novel => async dispatch => {
  dispatch({ type: SET_NOVEL, payload: novel });
};

export const getNovelAction =
  (followed, sourceId, novelUrl, novelId, sort, filter, defaultCategoryId) =>
  async dispatch => {
    try {
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
        let novel = await getNovel(sourceId, novelUrl);

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
          const fetchedNovelId = await insertNovel({
            ...fetchedNovel,
            categoryIds: [defaultCategoryId],
          });
          await insertChapters(fetchedNovelId, fetchedNovel.chapters);

          /**
           * Get novel from db.
           */
          novel = await getNovel(sourceId, novelUrl);
          novel.chapters = await getChapters(novel.novelId, sort, filter);

          dispatch({
            type: GET_NOVEL,
            payload: novel,
          });
        }
      }
    } catch (error) {
      showToast(error.message);
      // dispatch({ type: NOVEL_ERROR });
    }
  };

export const sortAndFilterChapters =
  (novelId, sort, filter) => async dispatch => {
    dispatch({ type: FETCHING_NOVEL });

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

export const showChapterTitlesAction = (novelId, value) => async dispatch => {
  dispatch({
    type: SET_NOVEL_SETTINGS,
    payload: { novelId, value: value },
  });
};

export const followNovelAction = novel => async dispatch => {
  await followNovel(novel.followed, novel.novelId);

  if (!novel.followNovel) {
    deleteUpdateFromDb(novel.novelId);
  }

  dispatch({
    type: UPDATE_IN_LIBRARY,
    payload: { novelUrl: novel.novelUrl, followed: !novel.followed },
  });

  // const res = await getLibrary();

  // dispatch({
  //   type: GET_LIBRARY_NOVELS,
  //   payload: res,
  // });

  showToast(!novel.followed ? 'Added to library' : 'Removed from library');
};

export const bookmarkChapterAction = chapters => async dispatch => {
  chapters.map(chapter => {
    bookmarkChapter(chapter.bookmark, chapter.chapterId);

    dispatch({
      type: BOOKMARK_CHAPTER,
      payload: {
        bookmark: chapter.bookmark,
        chapterId: chapter.chapterId,
      },
    });
  });
};

export const markChapterReadAction = (chapterId, novelId) => async dispatch => {
  await markChapterRead(chapterId);

  dispatch({
    type: CHAPTER_READ,
    payload: { chapterId },
  });

  const nextChapter = await getNextChapter(novelId, chapterId);

  dispatch({
    type: SET_LAST_READ,
    payload: { novelId, chapterId: nextChapter.chapterId },
  });

  /**
   * Reset progress on marked read
   */
  dispatch({
    type: SAVE_SCROLL_POSITION,
    payload: {
      position: 0,
      percentage: 0,
      chapterId,
      novelId,
    },
  });
};

export const markPreviousChaptersReadAction =
  (chapterId, novelId) => async dispatch => {
    await markPreviuschaptersRead(chapterId, novelId);

    dispatch({
      type: MARK_PREVIOUS_CHAPTERS_READ,
      payload: chapterId,
    });

    showToast('Marked previous chapters read');
  };

export const markChaptersRead =
  (chapters, novelId, sort, filter) => async dispatch => {
    try {
      chapters.map(chapter => markChapterRead(chapter.chapterId));

      const chaps = await getChapters(novelId, sort, filter);

      dispatch({
        type: GET_CHAPTERS,
        payload: chaps,
      });
    } catch (error) {
      showToast(error.message);
    }
  };

export const markPreviousChaptersUnreadAction =
  (chapterId, novelId) => async dispatch => {
    await markPreviousChaptersUnread(chapterId, novelId);

    dispatch({
      type: MARK_PREVIOUS_CHAPTERS_UNREAD,
      payload: chapterId,
    });
  };

export const markChapterUnreadAction =
  (chapters, novelId) => async (dispatch, getState) => {
    const { sort = 'ORDER BY chapterId ASC', filter = '' } =
      getState().preferenceReducer.novelSettings[novelId];

    chapters.map(chapter => markChapterUnread(chapter.chapterId));

    const chaps = await getChapters(novelId, sort, filter);

    dispatch({
      type: GET_CHAPTERS,
      payload: chaps,
    });
  };

/**
 *
 * @param {number} sourceId
 * @param {string} novelUrl
 * @param {number} novelId
 * @param {string} chapterUrl
 * @param {string} chapterName
 * @param {number} chapterId
 * @returns
 */
export const downloadChapterAction =
  (sourceId, novelUrl, novelId, chapterUrl, chapterName, chapterId) =>
  async dispatch => {
    // dispatch({
    //     type: CHAPTER_DOWNLOADING,
    //     payload: chapterId,
    // });
    dispatch({
      type: SET_DOWNLOAD_QUEUE,
      payload: [{ chapterId, chapterName }],
    });

    await downloadChapter(sourceId, novelUrl, novelId, chapterUrl, chapterId);

    dispatch({
      type: CHAPTER_DOWNLOADED,
      payload: chapterId,
    });

    ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
  };

/**
 *
 * @param {number} sourceId
 * @param {string} novelUrl
 * @param {import("./../../database/types").ChapterItem[]} chaps
 * @returns
 */
export const downloadAllChaptersAction =
  (sourceId, novelUrl, chaps) => async (dispatch, getState) => {
    try {
      const downloadQueue = getState().downloadsReducer.downloadQueue;
      /**
       * Filter downloaded chapters
       */
      let chapters = chaps.filter(chapter => chapter.downloaded === 0);

      /**
       * Filter chapters already in download queue
       */
      chapters = chapters.filter(
        chapter =>
          !downloadQueue.some(obj => obj.chapterId === chapter.chapterId),
      );

      chapters = chapters.map(chapter => ({
        ...chapter,
        sourceId,
        novelUrl,
      }));

      if (chapters.length > 0) {
        dispatch({ type: SET_DOWNLOAD_QUEUE, payload: chapters });

        const options = {
          taskName: 'Library Update',
          taskTitle: chapters[0].chapterName,
          taskDesc: '0/' + chapters.length,
          taskIcon: {
            name: 'notification_icon',
            type: 'drawable',
          },
          color: '#00adb5',
          linkingURI: 'lnreader://downloads/redirect',
          parameters: {
            delay: 1000,
          },
          progressBar: {
            max: chapters.length,
            value: 0,
          },
        };

        const sleep = time =>
          new Promise(resolve => setTimeout(() => resolve(), time));

        const veryIntensiveTask = async taskData => {
          await new Promise(async resolve => {
            for (
              let i = 0;
              BackgroundService.isRunning() && i < chapters.length;
              i++
            ) {
              if (BackgroundService.isRunning()) {
                // dispatch({
                //     type: CHAPTER_DOWNLOADING,
                //     payload: chapters[i].chapterId,
                // });

                if (!chapters[i].downloaded) {
                  await downloadChapter(
                    sourceId,
                    novelUrl,
                    chapters[i].novelId,
                    chapters[i].chapterUrl,
                    chapters[i].chapterId,
                  );
                }

                dispatch({
                  type: CHAPTER_DOWNLOADED,
                  payload: chapters[i].chapterId,
                });

                await BackgroundService.updateNotification({
                  taskTitle: chapters[i].chapterName,
                  taskDesc: i + 1 + '/' + chapters.length,
                  progressBar: {
                    max: chapters.length,
                    value: i + 1,
                  },
                });

                if (i + 1 === chapters.length) {
                  resolve();

                  Notifications.scheduleNotificationAsync({
                    content: {
                      title: 'Downloader',
                      body: 'Download completed',
                    },
                    trigger: null,
                  });
                }
                await sleep(taskData.delay);
              }
            }
          });
        };

        await BackgroundService.start(veryIntensiveTask, options);
      }
    } catch (error) {
      showToast(error.message);
    }
  };

export const deleteChapterAction =
  (sourceId, novelId, chapterId, chapterName) => async dispatch => {
    await deleteChapter(sourceId, novelId, chapterId);

    dispatch({
      type: CHAPTER_DELETED,
      payload: chapterId,
    });

    showToast(`Deleted ${chapterName}`);
  };

/**
 *
 * @param {number} sourceId
 * @param {import("../../database/types").ChapterItem[]} chapters
 * @returns
 */
export const deleteAllChaptersAction =
  (sourceId, chapters) => async dispatch => {
    await Promise.all(
      chapters.map(async chapter => {
        await deleteChapter(sourceId, chapter.novelId, chapter.chapterId);

        dispatch({
          type: CHAPTER_DELETED,
          payload: chapter.chapterId,
        });
      }),
    );
    showToast('Chapters deleted');
  };

export const updateNovelAction =
  (sourceId, novelUrl, novelId, sort, filter) => async (dispatch, getState) => {
    dispatch({ type: FETCHING_NOVEL });

    const { downloadNewChapters = false, refreshNovelMetadata = false } =
      getState().settingsReducer;

    const options = {
      downloadNewChapters,
      refreshNovelMetadata,
    };

    await updateNovel(sourceId, novelUrl, novelId, options);

    let novel = await getNovel(sourceId, novelUrl);
    let chapters = await getChapters(novel.novelId, sort, filter);

    dispatch({
      type: UPDATE_NOVEL,
      payload: { novel, chapters },
    });
  };
