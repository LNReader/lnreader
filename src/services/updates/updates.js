import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

import { getCategoryNovelsFromDb } from '../../database/queries/NovelQueriesV2';
import { getLibraryNovelsFromDb } from '../../database/queries/LibraryQueries';

import { showToast } from '../../hooks/showToast';
import { updateNovel } from './LibraryUpdateQueries';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const updateLibrary = async options => {
  const { onlyUpdateOngoingNovels, categoryId } = options;

  let libraryNovels = [];

  if (categoryId) {
    libraryNovels = await getCategoryNovelsFromDb(
      categoryId,
      onlyUpdateOngoingNovels,
    );
  } else {
    libraryNovels = await getLibraryNovelsFromDb(onlyUpdateOngoingNovels);
  }

  const notificationOptions = {
    taskName: 'Library Update',
    taskTitle: 'Updating library',
    taskDesc: '(0/' + libraryNovels.length + ')',
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 1000 },
    linkingURI: 'lnreader://updates',
    progressBar: { max: libraryNovels.length, value: 0 },
  };

  const libraryUpdateBackgroundAction = async taskData =>
    await new Promise(async resolve => {
      for (
        let i = 0;
        BackgroundService.isRunning() && i < libraryNovels.length;
        i++
      ) {
        try {
          /**
           * Update chapters
           */
          await updateNovel(
            libraryNovels[i].sourceId,
            libraryNovels[i].novelUrl,
            libraryNovels[i].novelId,
            options,
          );

          /**
           * Update notification
           */
          await BackgroundService.updateNotification({
            taskTitle: libraryNovels[i].novelName,
            taskDesc: '(' + (i + 1) + '/' + libraryNovels.length + ')',
            progressBar: { max: libraryNovels.length, value: i + 1 },
          });

          const nextNovelIndex = i + 1;

          if (
            nextNovelIndex in libraryNovels &&
            libraryNovels[nextNovelIndex].sourceId === libraryNovels[i].sourceId
          ) {
            await sleep(taskData.delay);
          }
        } catch (error) {
          showToast(libraryNovels[i].novelName + ': ' + error.message);
        }
      }
      /**
       * When updating library is finished
       */
      resolve();

      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Library Updated',
          body: libraryNovels.length + ' novels updated',
        },
        trigger: null,
      });
    });

  if (libraryNovels.length > 0) {
    await BackgroundService.start(
      libraryUpdateBackgroundAction,
      notificationOptions,
    );
  }
};

export { updateLibrary };
