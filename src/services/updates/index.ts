import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

import {
  getLibraryWithCategory,
  getLibraryNovelsFromDb,
} from '../../database/queries/LibraryQueries';

import { showToast } from '../../utils/showToast';
import { UpdateNovelOptions, updateNovel } from './LibraryUpdateQueries';
import { LibraryNovelInfo } from '@database/types';
import { sleep } from '@utils/sleep';
import { MMKVStorage, getMMKVObject } from '@utils/mmkv/mmkv';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import dayjs from 'dayjs';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { APP_SETTINGS, AppSettings } from '@hooks/persisted/useSettings';

interface TaskData {
  delay: number;
}

const updateLibrary = async (categoryId?: number) => {
  const { downloadNewChapters, refreshNovelMetadata, onlyUpdateOngoingNovels } =
    getMMKVObject<AppSettings>(APP_SETTINGS) || {};
  const options: UpdateNovelOptions = {
    downloadNewChapters: downloadNewChapters || false,
    refreshNovelMetadata: refreshNovelMetadata || false,
  };

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

  const libraryUpdateBackgroundAction = async (taskData?: TaskData) => {
    try {
      MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.UPDATE_LIBRARY);
      MMKVStorage.set(LAST_UPDATE_TIME, dayjs().format('YYYY-MM-DD HH:mm:ss'));
      for (
        let i = 0;
        BackgroundService.isRunning() && i < libraryNovels.length;
        i++
      ) {
        try {
          if (BackgroundService.isRunning()) {
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
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Library Updated',
                  body: libraryNovels.length + ' novels updated',
                },
                trigger: null,
              });
              return;
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
    } finally {
      MMKVStorage.delete(BACKGROUND_ACTION);
    }
  };

  if (libraryNovels.length > 0 && !MMKVStorage.getString(BACKGROUND_ACTION)) {
    await BackgroundService.start<TaskData>(
      libraryUpdateBackgroundAction,
      notificationOptions,
    );
  }
};

export { updateLibrary };
