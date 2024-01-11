import { ToastAndroid } from 'react-native';

import {
  CHAPTER_DOWNLOADING,
  CHAPTER_DOWNLOADED,
  CHAPTER_DELETED,
  ALL_CHAPTER_DELETED,
} from './novel.types';

import {
  downloadChapter,
  deleteChapter,
  deleteChapters,
} from '@database/queries/ChapterQueries';
import { showToast } from '@utils/showToast';

import * as Notifications from 'expo-notifications';

import BackgroundService from 'react-native-background-actions';
import { SET_DOWNLOAD_QUEUE } from '../downloads/donwloads.types';

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

export const downloadAllChaptersAction =
  (pluginId, chaps) => async (dispatch, getState) => {
    try {
      /**
       * Filter downloaded chapters
       */
      let chapters = chaps.filter(chapter => !chapter.isDownloaded);

      const downloadQueue = getState().downloadsReducer.downloadQueue;
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
                  dispatch({
                    type: CHAPTER_DOWNLOADING,
                    payload: {
                      downloadingChapter: chapters[i],
                    },
                  });
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
