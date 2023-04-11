import { ToastAndroid } from 'react-native';

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
  NOVEL_ERROR,
  SET_NOVEL_SETTINGS,
  BOOKMARK_CHAPTER,
  MARK_PREVIOUS_CHAPTERS_READ,
  MARK_PREVIOUS_CHAPTERS_UNREAD,
  ALL_CHAPTER_DELETED,
} from './novel.types';

import { fetchNovel } from '@services/plugin/fetch';
import {
  switchNovelToLibrary,
  insertNovelandChapters,
  getNovel,
} from '@database/queries/NovelQueries';
import { insertChapters } from '@database/queries/ChapterQueries';
import {
  getChapters,
  markChapterRead,
  downloadChapter,
  deleteChapter,
  markChapterUnread,
  bookmarkChapter,
  markPreviuschaptersRead,
  markPreviousChaptersUnread,
  getNextChapter,
  deleteChapters,
} from '@database/queries/ChapterQueries';
import {
  SET_CHAPTER_LIST_PREF,
  SET_LAST_READ,
} from '../preferences/preference.types';
import { showToast } from '@hooks/showToast';

import * as Notifications from 'expo-notifications';

import BackgroundService from 'react-native-background-actions';
import { SET_DOWNLOAD_QUEUE } from '../downloads/donwloads.types';
import { updateNovel } from '@services/updates/LibraryUpdateQueries';

export const setNovel = novel => async dispatch => {
  dispatch({ type: SET_NOVEL, payload: { novel } });
};

// Always use {} for payload

export const getNovelAction =
  (pluginId, novelUrl, sort, filter) => async dispatch => {
    try {
      dispatch({ type: LOADING_NOVEL });

      dispatch({ type: FETCHING_NOVEL });

      /**
       * Check if novel is cached.
       */
      let novel = await getNovel(novelUrl);
      if (novel) {
        /**
         * Get chapters from db.
         */
        chapters = await getChapters(novel.id, sort, filter);
        dispatch({
          type: GET_NOVEL,
          payload: { novel, chapters },
        });
      } else {
        /**
         * Fetch novel from source.
         */
        const fetchedNovel = await fetchNovel(pluginId, novelUrl);
        /**
         * Insert novel in db.
         */
        await insertNovelandChapters(pluginId, fetchedNovel);
        /**
         * Get novel from db.
         */
        novel = await getNovel(novelUrl);
        chapters = await getChapters(novel.id, sort, filter);
        dispatch({
          type: GET_NOVEL,
          payload: { novel, chapters },
        });
      }
    } catch (error) {
      showToast(error.message);
      dispatch({ type: NOVEL_ERROR });
    }
  };

export const sortAndFilterChapters =
  (novelId, sort, filter) => async dispatch => {
    dispatch({ type: FETCHING_NOVEL });

    const chapters = await getChapters(novelId, sort, filter);

    dispatch({
      type: GET_CHAPTERS,
      payload: { chapters },
    });

    dispatch({
      type: SET_CHAPTER_LIST_PREF,
      payload: { novelId, sort, filter },
    });
  };

export const showChapterTitlesAction = (novelId, value) => async dispatch => {
  dispatch({
    type: SET_NOVEL_SETTINGS,
    payload: { novelId, showChapterTitles: value },
  });
};

export const followNovelAction = novel => async dispatch => {
  await switchNovelToLibrary(novel.url, novel.pluginId);
  dispatch({
    type: UPDATE_IN_LIBRARY,
    payload: { inLibrary: 1 - novel.inLibrary },
  });
};

export const bookmarkChapterAction = chapters => async dispatch => {
  chapters.map(chapter => {
    bookmarkChapter(chapter.bookmark, chapter.id);

    dispatch({
      type: BOOKMARK_CHAPTER,
      payload: {
        bookmark: chapter.bookmark,
        chapterId: chapter.id,
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
    payload: { lastRead: nextChapter },
  });
};

export const markPreviousChaptersReadAction =
  (chapterId, novelId) => async dispatch => {
    await markPreviuschaptersRead(chapterId, novelId);

    dispatch({
      type: MARK_PREVIOUS_CHAPTERS_READ,
      payload: { chapterId },
    });

    showToast('Marked previous chapters read');
  };

export const markChaptersRead =
  (chapters, novelId, sort, filter) => async dispatch => {
    try {
      chapters.map(chapter => markChapterRead(chapter.id));

      const chaps = await getChapters(novelId, sort, filter);

      dispatch({
        type: GET_CHAPTERS,
        payload: { chapters: chaps },
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
      payload: { chapterId },
    });
  };

export const markChapterUnreadAction =
  (chapters, novelId, sort, filter) => async dispatch => {
    chapters.map(chapter => markChapterUnread(chapter.chapterId));

    const chaps = await getChapters(novelId, sort, filter);

    dispatch({
      type: GET_CHAPTERS,
      payload: { chapters: chaps },
    });
  };

/**
 * When propertise are stand alone, they should have prefix (novel | chapter)
 * @param {string} pluginId
 * @param {string} novelUrl
 * @param {number} novelId
 * @param {string} chapterlUrl
 * @param {string} chapterlName
 * @param {number} chapterId
 * @returns
 */
export const downloadChapterAction =
  (pluginId, novelId, chapterUrl, chapterName, chapterId) => async dispatch => {
    dispatch({
      type: CHAPTER_DOWNLOADING,
      payload: {
        downloadingChapter: {
          id: chapterId,
          novelId: novelId,
          name: chapterName,
          pluginId: pluginId,
          url: chapterUrl,
        },
      },
    });
    dispatch({
      type: SET_DOWNLOAD_QUEUE,
      payload: [
        {
          id: chapterId,
          novelId: novelId,
          name: chapterName,
          pluginId: pluginId,
          url: chapterUrl,
        },
      ],
    });

    await downloadChapter(pluginId, novelId, chapterId, chapterUrl);

    dispatch({
      type: CHAPTER_DOWNLOADED,
      payload: { chapterId },
    });

    ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
  };

/**
 *
 * @param {string} pluginId
 * @param {string} novelUrl
 * @param {import("../../database/types").ChapterItem[]} chaps
 * @returns
 */
export const downloadAllChaptersAction =
  (pluginId, novelUrl, chaps) => async (dispatch, getState) => {
    try {
      const downloadQueue = getState().downloadsReducer.downloadQueue;
      /**
       * Filter downloaded chapters
       */
      let chapters = chaps.filter(chapter => chapter.isDownloaded === 0);

      /**
       * Filter chapters already in download queue
       */
      chapters = chapters.filter(
        chapter => !downloadQueue.some(obj => obj.id === chapter.id),
      );

      chapters = chapters.map(chapter => ({
        ...chapter,
        pluginId,
      }));

      if (chapters.length > 0) {
        dispatch({ type: SET_DOWNLOAD_QUEUE, payload: chapters });

        const options = {
          taskName: 'Library Update',
          taskTitle: chapters[0].name,
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
                try {
                  if (!chapters[i].isDownloaded) {
                    await downloadChapter(
                      pluginId,
                      chapters[i].novelId,
                      chapters[i].id,
                      chapters[i].url,
                    );
                  }

                  dispatch({
                    type: CHAPTER_DOWNLOADED,
                    payload: { chapterId: chapters[i].id },
                  });
                } catch (error) {
                  Notifications.scheduleNotificationAsync({
                    content: {
                      title: chapters[i].name,
                      body: `Download failed: ${error.message}`,
                    },
                    trigger: null,
                  });
                }

                await BackgroundService.updateNotification({
                  taskTitle: chapters[i].name,
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
  (pluginId, novelId, chapterId, chapterName) => async dispatch => {
    await deleteChapter(pluginId, novelId, chapterId);

    dispatch({
      type: CHAPTER_DELETED,
      payload: { chapterId },
    });

    showToast(`Deleted ${chapterName}`);
  };

/**
 *
 * @param {string} pluginId
 * @param {import("../../database/types").ChapterItem[]} chapters
 * @returns
 */
export const deleteAllChaptersAction =
  (pluginId, novelId, chapters) => async dispatch => {
    await deleteChapters(pluginId, novelId, chapters);

    dispatch({
      type: ALL_CHAPTER_DELETED,
    });

    showToast('Chapters deleted');
  };

export const updateNovelAction =
  (pluginId, novelUrl, novelId, sort, filter) => async (dispatch, getState) => {
    dispatch({ type: FETCHING_NOVEL });

    const { downloadNewChapters = false, refreshNovelMetadata = false } =
      getState().settingsReducer;

    const options = {
      downloadNewChapters,
      refreshNovelMetadata,
    };

    await updateNovel(pluginId, novelUrl, novelId, options);

    let novel = await getNovel(novelUrl);
    let chapters = await getChapters(novelId, sort, filter);

    dispatch({
      type: UPDATE_NOVEL,
      payload: { novel, chapters },
    });
  };
