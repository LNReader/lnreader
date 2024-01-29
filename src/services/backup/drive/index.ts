import { DriveFile } from '@api/drive/types';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { createFile, exists, makeDir } from '@api/drive';
import {
  categoryTask,
  downloadTask,
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
import { getString } from '@strings/translations';

interface TaskData {
  delay: number;
  backupFolder: DriveFile;
}

const driveBackupAction = async (taskData?: TaskData) => {
  try {
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.BACKUP);
    if (!taskData) {
      throw new Error('No data provided');
    }
    const { delay, backupFolder } = taskData;
    await sleep(delay);

    const dataFolder = await makeDir('Data', backupFolder.id);
    const downloadFolder = await makeDir('Download', backupFolder.id);
    const novelFolder = await makeDir('NovelAndChapters', dataFolder.id);

    const taskList = [
      versionTask(dataFolder.id),
      novelTask(novelFolder.id),
      categoryTask(dataFolder.id),
      downloadTask(downloadFolder.id),
      settingTask(dataFolder.id),
    ];

    for (let i = 0; i < taskList.length; i++) {
      const { taskType, subtasks } = await taskList[i];
      for (let j = 0; j < subtasks.length; j++) {
        await BackgroundService.updateNotification({
          taskDesc: `${getString('common.backup')} ${taskType} (${j}/${
            subtasks.length
          })`,
          progressBar: {
            max: subtasks.length,
            value: j,
          },
        })
          .then(() => subtasks[j]())
          .then(backupPackage =>
            createFile(
              backupPackage.name,
              backupPackage.mimeType,
              backupPackage.content,
              backupPackage.folderTree[0],
            ),
          )
          .then(() => sleep(delay))
          .catch(error => {
            throw error;
          });
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: getString('backupScreen.drive.backup'),
        body: getString('common.done'),
      },
      trigger: null,
    });
  } catch (error: any) {
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getString('backupScreen.drive.backupInterruped'),
          body: error.message,
        },
        trigger: null,
      });
    }
  } finally {
    MMKVStorage.delete(BACKGROUND_ACTION);
    await BackgroundService.stop();
  }
};

export const createBackup = async (backupFolder: DriveFile) => {
  return BackgroundService.start(driveBackupAction, {
    taskName: 'Drive Backup',
    taskTitle: getString('backupScreen.drive.backup'),
    taskDesc: getString('common.preparing'),
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 500, backupFolder },
    linkingURI: 'lnreader://updates',
  }).catch(async (error: Error) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: getString('backupScreen.drive.backupInterruped'),
        body: error.message,
      },
      trigger: null,
    });
    BackgroundService.stop();
  });
};

const driveRestoreAction = async (taskData?: TaskData) => {
  try {
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.RESTORE);
    if (!taskData) {
      throw new Error('No data provided');
    }
    const { delay, backupFolder } = taskData;
    await sleep(delay);

    const dataFolder = await exists('Data', true, backupFolder.id);
    const downloadFolder = await exists('Download', true, backupFolder.id);
    const novelFolder = await exists('NovelAndChapters', true, dataFolder?.id);
    if (!dataFolder || !downloadFolder || !novelFolder) {
      throw new Error('Invalid backup folder');
    }

    const taskList = [
      restoreNovel(novelFolder.id),
      restoreCategory(dataFolder.id),
      retoreDownload(downloadFolder.id),
      restoreSetting(dataFolder.id),
    ];

    for (let i = 0; i < taskList.length; i++) {
      const { taskType, subtasks } = await taskList[i]();
      for (let j = 0; j < subtasks.length; j++) {
        await BackgroundService.updateNotification({
          taskDesc: `${getString('common.restore')} ${taskType} (${j}/${
            subtasks.length
          })`,
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
        title: getString('backupScreen.drive.restore'),
        body: getString('common.done'),
      },
      trigger: null,
    });
  } catch (error: any) {
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getString('backupScreen.drive.restoreInterruped'),
          body: error.message,
        },
        trigger: null,
      });
    }
  } finally {
    MMKVStorage.delete(BACKGROUND_ACTION);
    await BackgroundService.stop();
  }
};

export const driveRestore = async (backupFolder: DriveFile) => {
  return BackgroundService.start(driveRestoreAction, {
    taskName: 'Drive Restore',
    taskTitle: 'Drive Restore',
    taskDesc: 'Preparing',
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 500, backupFolder },
    linkingURI: 'lnreader://updates',
  }).catch(async (e: Error) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: getString('backupScreen.drive.restoreInterruped'),
        body: e.message,
      },
      trigger: null,
    });
    await BackgroundService.stop();
  });
};
