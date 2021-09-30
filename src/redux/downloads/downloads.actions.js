import {
  SET_DOWNLOAD_QUEUE,
  CANCEL_DOWNLOAD,
  PAUSE_DOWNLOADS,
} from './donwloads.types';
import BackgroundService from 'react-native-background-actions';
import {downloadChapter} from '../../database/queries/ChapterQueries';
import {CHAPTER_DOWNLOADED} from '../novel/novel.types';
import {showToast} from '../../hooks/showToast';

export const pauseDownloads = () => async dispatch => {
  showToast('Download paused');

  await BackgroundService.stop();

  dispatch({type: PAUSE_DOWNLOADS});
};

export const resumeDownloads = chapters => async dispatch => {
  showToast('Download resumed');

  const options = {
    taskName: 'Library Update',
    taskTitle: chapters[0].chapterName,
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
          if (!chapters[i].downloaded) {
            await downloadChapter(
              chapters[i].sourceId,
              chapters[i].novelUrl,
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

  dispatch({type: PAUSE_DOWNLOADS});
};

export const cancelDownload = () => async dispatch => {
  await BackgroundService.stop();

  dispatch({type: CANCEL_DOWNLOAD});
};
