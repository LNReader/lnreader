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
import { getString } from '@strings/translations';

interface TaskData {
  delay: number;
  libraryNovels: LibraryNovelInfo[];
  options: UpdateNovelOptions;
}

const libraryUpdateBackgroundAction = async (taskData?: TaskData) => {
  try {
    if (!taskData) {
      return;
    }
    const { delay, libraryNovels, options } = taskData;
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
            libraryNovels[i].path,
            libraryNovels[i].id,
            options,
          );

          /**
           * Update notification
           */
          await BackgroundService.updateNotification({
            taskTitle: '(' + (i + 1) + '/' + libraryNovels.length + ')',
            taskDesc: libraryNovels[i].name,
            progressBar: { max: libraryNovels.length, value: i + 1 },
          });
          await sleep(delay ?? 1000);
        }
      } catch (error: any) {
        showToast(libraryNovels[i].name + ': ' + error.message);
        continue;
      }
    }
  } finally {
    MMKVStorage.delete(BACKGROUND_ACTION);
    Notifications.scheduleNotificationAsync({
      content: {
        title: getString('updatesScreen.libraryUpdated'),
        body: getString('updatesScreen.novelsUpdated', {
          num: taskData?.libraryNovels.length || 0,
        }),
      },
      trigger: null,
    });
    BackgroundService.stop();
  }
};

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
      filter:
        `categoryId = ${categoryId}` +
        (onlyUpdateOngoingNovels ? " AND status = 'Ongoing'" : ''),
    });
  } else {
    libraryNovels = (await getLibraryNovelsFromDb(
      onlyUpdateOngoingNovels,
    )) as LibraryNovelInfo[];
  }

  const notificationOptions = {
    taskName: 'Library Update',
    taskTitle: getString('updatesScreen.updatingLibrary'),
    taskDesc: '(0/' + libraryNovels.length + ')',
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 1000, libraryNovels, options },
    linkingURI: 'lnreader://updates',
    progressBar: { max: libraryNovels.length, value: 0 },
  };

  const anotherBackground = MMKVStorage.getString(BACKGROUND_ACTION);
  if (libraryNovels.length > 0 && !anotherBackground) {
    await BackgroundService.start<TaskData>(
      libraryUpdateBackgroundAction,
      notificationOptions,
    );
  } else {
    if (anotherBackground) {
      showToast(getString('browseScreen.migration.anotherServiceIsRunning'));
    } else {
      showToast("There's no novel to be updated");
    }
  }
};

export { updateLibrary };
