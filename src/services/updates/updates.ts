import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

import {
  getLibraryWithCategory,
  getLibraryNovelsFromDb,
} from '../../database/queries/LibraryQueries';

import { showToast } from '../../hooks/showToast';
import { updateNovel } from './LibraryUpdateQueries';
import { LibraryNovelInfo } from '@database/types';
import { sleep } from '@utils/sleep';

interface TaskData {
  delay: number;
}

export interface UpdateLibraryOptions {
  downloadNewChapters?: boolean;
  onlyUpdateOngoingNovels?: boolean;
  refreshNovelMetadata?: boolean;
  categoryId?: number;
}

const updateLibrary = async (options: UpdateLibraryOptions) => {
  const { onlyUpdateOngoingNovels, categoryId } = options;

  let libraryNovels: LibraryNovelInfo[] = [];

  if (categoryId) {
    libraryNovels = await getLibraryWithCategory({
      filter: `categoryId = ${categoryId}`,
    });
  } else {
    libraryNovels = (await getLibraryNovelsFromDb(
      onlyUpdateOngoingNovels,
    )) as LibraryNovelInfo[];
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

  const libraryUpdateBackgroundAction = async (taskData?: TaskData) =>
    await new Promise<void>(async resolve => {
      for (
        let i = 0;
        BackgroundService.isRunning() && i < libraryNovels.length;
        i++
      ) {
        try {
          if (BackgroundService.isRunning()) {
            /**
             * Update chapters
             */
            await updateNovel(
              libraryNovels[i].pluginId,
              libraryNovels[i].url,
              libraryNovels[i].id,
              options,
            );

            /**
             * Update notification
             */
            await BackgroundService.updateNotification({
              taskTitle: libraryNovels[i].name,
              taskDesc: '(' + (i + 1) + '/' + libraryNovels.length + ')',
              progressBar: { max: libraryNovels.length, value: i + 1 },
            });

            /**
             * When updating library is finished
             */
            if (libraryNovels.length === i + 1) {
              resolve();

              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Library Updated',
                  body: libraryNovels.length + ' novels updated',
                },
                trigger: null,
              });
            }

            const nextNovelIndex = i + 1;

            if (
              nextNovelIndex in libraryNovels &&
              libraryNovels[nextNovelIndex].pluginId ===
                libraryNovels[i].pluginId
            ) {
              await sleep(taskData?.delay ?? 0);
            }
          }
        } catch (error: any) {
          showToast(libraryNovels[i].name + ': ' + error.message);
          continue;
        }
      }
    });

  if (libraryNovels.length > 0) {
    await BackgroundService.start<TaskData>(
      libraryUpdateBackgroundAction,
      notificationOptions,
    );
  }
};

export { updateLibrary };
