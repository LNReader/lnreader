import { DriveFile } from '@api/drive/types';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { createFile, makeDir } from '@api/drive';
import {
  categoryTask,
  downloadTask,
  novelCoverTask,
  novelTask,
  settingTask,
  themeTask,
  versionTask,
} from './backupTasks';

interface TaskData {
  delay: number;
  backupFolder: DriveFile;
}

const driveBackupAction = async (taskData?: TaskData) => {
  try {
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
      novelCoverTask(downloadFolder.id),
      categoryTask(dataFolder.id),
      downloadTask(downloadFolder.id),
      settingTask(dataFolder.id),
      themeTask(dataFolder.id),
    ];

    for (let i = 0; i < taskList.length; i++) {
      const { taskType, subtasks } = await taskList[i];
      for (let j = 0; j < subtasks.length; j++) {
        const backupPackage = await subtasks[j]();
        await BackgroundService.updateNotification({
          taskDesc: `Backup ${taskType} (${j}/${subtasks.length})`,
          progressBar: {
            max: subtasks.length,
            value: j,
          },
        })
          .then(() =>
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
        title: 'Drive backup',
        body: 'Done',
      },
      trigger: null,
    });
  } catch (error: any) {
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Drive Backup Interruped',
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

export const createBackup = async (backupFolder: DriveFile) => {
  MMKVStorage.set('HAS_BACKGROUND_TASK', true);
  try {
    return BackgroundService.start(driveBackupAction, {
      taskName: 'Drive Backup',
      taskTitle: 'Drive Backup',
      taskDesc: 'Preparing',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 1000, backupFolder },
      linkingURI: 'lnreader://updates',
    });
  } catch (e: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Import error',
        body: e.message,
      },
      trigger: null,
    });
    await BackgroundService.stop();
    MMKVStorage.set('HAS_BACKGROUND_TASK', false);
    throw e;
  }
};
