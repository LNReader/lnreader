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
  versionTask,
} from './backupTasks';

import {
  restoreCategory,
  restoreNovel,
  restoreSetting,
  retoreDownload,
} from './restoreTasks';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';

interface TaskData {
  delay: number;
  host: string;
  backupFolder: string;
}

const remoteBackupAction = async (taskData?: TaskData) => {
  try {
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.BACKUP);
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
    }
  } finally {
    MMKVStorage.delete(BACKGROUND_ACTION);
    BackgroundService.stop();
  }
};

export const createBackup = async (host: string, backupFolder: string) => {
  return BackgroundService.start(remoteBackupAction, {
    taskName: 'Self Host Backup',
    taskTitle: 'Self Host Backup',
    taskDesc: 'Preparing',
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 200, backupFolder, host },
    linkingURI: 'lnreader://updates',
  }).catch((e: Error) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Self Host Backup Interruped',
        body: e.message,
      },
      trigger: null,
    });
    BackgroundService.stop();
  });
};

const remoteRestoreAction = async (taskData?: TaskData) => {
  try {
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.RESTORE);
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
      restoreSetting(host, dataFolder),
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
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Self Host Restore Interruped',
          body: error.message,
        },
        trigger: null,
      });
    }
  } finally {
    MMKVStorage.delete(BACKGROUND_ACTION);
    BackgroundService.stop();
  }
};

export const remoteRestore = async (host: string, backupFolder: string) => {
  return BackgroundService.start(remoteRestoreAction, {
    taskName: 'Self Host Restore',
    taskTitle: 'Self Host Restore',
    taskDesc: 'Preparing',
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 200, backupFolder, host },
    linkingURI: 'lnreader://updates',
  }).catch((e: Error) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Self Host Restore Interruped',
        body: e.message,
      },
      trigger: null,
    });
    BackgroundService.stop();
  });
};
