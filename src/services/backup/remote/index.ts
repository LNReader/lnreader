import { MMKVStorage } from '@utils/mmkv/mmkv';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { upload } from '@api/remote';
import {
  categoryTask,
  downloadTask,
  novelCoverTask,
  novelTask,
  settingTask,
  themeTask,
  versionTask,
} from './backupTasks';

import {
  restoreCategory,
  restoreNovel,
  // restoreSetting,
  restoreTheme,
  retoreDownload,
} from './restoreTasks';

interface TaskData {
  delay: number;
  host: string;
  backupFolder: string;
}

const remoteBackupAction = async (taskData?: TaskData) => {
  try {
    if (!taskData) {
      throw new Error('No data provided');
    }
    const { delay, backupFolder, host } = taskData;
    await sleep(delay);

    const dataFolder = [backupFolder, 'Data'];
    const downloadFolder = [backupFolder, 'Download'];
    const novelFolder = [backupFolder, 'Data', 'NovelAndChapters'];

    const taskList = [
      versionTask(dataFolder),
      novelTask(novelFolder),
      novelCoverTask(downloadFolder),
      categoryTask(dataFolder),
      downloadTask(downloadFolder),
      settingTask(dataFolder),
      themeTask(dataFolder),
    ];

    for (let i = 0; i < taskList.length; i++) {
      const { taskType, subtasks } = await taskList[i];
      for (let j = 0; j < subtasks.length; j++) {
        await BackgroundService.updateNotification({
          taskDesc: `Backup ${taskType} (${j}/${subtasks.length})`,
          progressBar: {
            max: subtasks.length,
            value: j,
          },
        })
          .then(() => subtasks[j]())
          .then(backupPackage => upload(host, backupPackage))
          .then(() => sleep(delay))
          .catch(error => {
            throw error;
          });
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Self Host Backup',
        body: 'Done',
      },
      trigger: null,
    });
  } catch (error: any) {
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Self Host Backup Interruped',
          body: error.message,
        },
        trigger: null,
      });
      await BackgroundService.stop();
    }
  } finally {
    MMKVStorage.set('HAS_BACKGROUND_TASK', false);
  }
};

export const createBackup = async (host: string, backupFolder: string) => {
  MMKVStorage.set('HAS_BACKGROUND_TASK', true);
  try {
    return BackgroundService.start(remoteBackupAction, {
      taskName: 'Self Host Backup',
      taskTitle: 'Self Host Backup',
      taskDesc: 'Preparing',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 200, backupFolder, host },
      linkingURI: 'lnreader://updates',
    });
  } catch (e: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Self Host Backup Interruped',
        body: e.message,
      },
      trigger: null,
    });
    await BackgroundService.stop();
    MMKVStorage.set('HAS_BACKGROUND_TASK', false);
    throw e;
  }
};

const remoteRestoreAction = async (taskData?: TaskData) => {
  try {
    if (!taskData) {
      throw new Error('No data provided');
    }
    const { delay, backupFolder, host } = taskData;
    await sleep(delay);

    const dataFolder = [backupFolder, 'Data'];
    const downloadFolder = [backupFolder, 'Download'];
    const novelFolder = [backupFolder, 'Data', 'NovelAndChapters'];

    if (!dataFolder || !downloadFolder || !novelFolder) {
      throw new Error('Invalid backup folder');
    }

    const taskList = [
      restoreNovel(host, novelFolder),
      restoreCategory(host, dataFolder),
      retoreDownload(host, downloadFolder),
      // restoreSetting(host, dataFolder),
      restoreTheme(host, dataFolder),
    ];

    for (let i = 0; i < taskList.length; i++) {
      const { taskType, subtasks } = await taskList[i]();
      for (let j = 0; j < subtasks.length; j++) {
        await BackgroundService.updateNotification({
          taskDesc: `Restore ${taskType} (${j}/${subtasks.length})`,
          progressBar: {
            max: subtasks.length,
            value: j,
          },
        })
          .then(() => subtasks[j]())
          .then(() => sleep(delay))
          .catch(error => {
            throw error;
          });
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Self Host Restore',
        body: 'Done',
      },
      trigger: null,
    });
  } catch (error: any) {
    console.log(error);
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Self Host Restore Interruped',
          body: error.message,
        },
        trigger: null,
      });
      await BackgroundService.stop();
    }
  } finally {
    MMKVStorage.set('HAS_BACKGROUND_TASK', false);
  }
};

export const remoteRestore = async (host: string, backupFolder: string) => {
  MMKVStorage.set('HAS_BACKGROUND_TASK', true);
  try {
    return BackgroundService.start(remoteRestoreAction, {
      taskName: 'Self Host Restore',
      taskTitle: 'Self Host Restore',
      taskDesc: 'Preparing',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 200, backupFolder, host },
      linkingURI: 'lnreader://updates',
    });
  } catch (e: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Self Host Restore Interruped',
        body: e.message,
      },
      trigger: null,
    });
    await BackgroundService.stop();
    MMKVStorage.set('HAS_BACKGROUND_TASK', false);
    throw e;
  }
};
