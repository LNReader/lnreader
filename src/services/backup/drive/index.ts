import { DriveFile } from '@api/drive/types';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { exists } from '@api/drive';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { getString } from '@strings/translations';
import { CACHE_DIR_PATH, prepareBackupData } from '../utils';
import { updateMetadata, uploadMedia } from '@api/drive/request';
import { AppDownloadFolder } from '@utils/constants/download';

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
    await prepareBackupData(CACHE_DIR_PATH)
      .then(() => sleep(delay))
      .then(() => uploadMedia(CACHE_DIR_PATH))
      .then(file => {
        return updateMetadata(
          file.id,
          {
            name: 'data.zip',
            mimeType: 'application/zip',
            parents: [backupFolder.id],
          },
          file.parents[0],
        );
      })
      .then(() => uploadMedia(AppDownloadFolder))
      .then(file => {
        return updateMetadata(
          file.id,
          {
            name: 'download.zip',
            mimeType: 'application/zip',
            parents: [backupFolder.id],
          },
          file.parents[0],
        );
      })
      .then(() => {
        return Notifications.scheduleNotificationAsync({
          content: {
            title: getString('backupScreen.drive.backup'),
            body: getString('common.done'),
          },
          trigger: null,
        });
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
