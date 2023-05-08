import { CANCEL_DOWNLOAD, PAUSE_DOWNLOADS } from './donwloads.types';
import BackgroundService from 'react-native-background-actions';
import { downloadChapter } from '@database/queries/ChapterQueries';
import { CHAPTER_DOWNLOADED } from '../novel/novel.types';
import { showToast } from '@hooks/showToast';

import * as Notifications from 'expo-notifications';

export const pauseDownloads = () => async dispatch => {
  showToast('Download paused');

  await BackgroundService.stop();

  dispatch({ type: PAUSE_DOWNLOADS });
};

export const resumeDownloads = chapters => async dispatch => {
  showToast('Download resumed');
  const options = {
    taskName: 'Library Update',
    taskTitle: chapters[0].name,
    taskDesc: '0/' + chapters.length,
    taskIcon: {
      name: 'notification_icon',
      type: 'drawable',
    },
    color: '#00adb5',
    parameters: {
      delay: 1000,
    },
    linkingURI: 'lnreader://downloads',
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
                chapters[i].pluginId,
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
            await BackgroundService.stop();

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

  dispatch({ type: PAUSE_DOWNLOADS });
};

export const cancelDownload = () => async dispatch => {
  await BackgroundService.stop();

  dispatch({ type: CANCEL_DOWNLOAD });
};
