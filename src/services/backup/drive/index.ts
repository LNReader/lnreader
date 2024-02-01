import { DriveFile } from '@api/drive/types';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { exists } from '@api/drive';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { getString } from '@strings/translations';
import { CACHE_DIR_PATH, prepareBackupData, restoreData } from '../utils';
import { download, updateMetadata, uploadMedia } from '@api/drive/request';
import { AppDownloadFolder } from '@utils/constants/download';
import { ZipBackupName } from '../types';

interface TaskData {
  delay: number;
  backupFolder: DriveFile;
}

const driveBackupAction = async (taskData?: TaskData) => {
  try {
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.BACKUP);
    if (!taskData) {
      throw new Error(getString('backupScreen.noDataProvided'));
    }
    const { delay, backupFolder } = taskData;
    await BackgroundService.updateNotification({
      taskDesc: getString('backupScreen.preparingData'),
      progressBar: {
        indeterminate: true,
        value: 0,
        max: 3,
      },
    })
      .then(() => prepareBackupData(CACHE_DIR_PATH))
      .then(() =>
        BackgroundService.updateNotification({
          taskDesc: getString('backupScreen.uploadingData'),
          progressBar: {
            indeterminate: true,
            value: 1,
            max: 3,
          },
        }),
      )
      .then(() => sleep(delay))
      .then(() => uploadMedia(CACHE_DIR_PATH))
      .then(file => {
        return updateMetadata(
          file.id,
          {
            name: ZipBackupName.DATA,
            mimeType: 'application/zip',
            parents: [backupFolder.id],
          },
          file.parents[0],
        );
      })
      .then(() =>
        BackgroundService.updateNotification({
          taskDesc: getString('backupScreen.uploadingDownloadedFiles'),
          progressBar: {
            indeterminate: true,
            value: 2,
            max: 3,
          },
        }),
      )
      .then(() => uploadMedia(AppDownloadFolder))
      .then(file => {
        return updateMetadata(
          file.id,
          {
            name: ZipBackupName.DOWNLOAD,
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
      throw new Error(getString('backupScreen.noDataProvided'));
    }
    const { delay, backupFolder } = taskData;
    await sleep(delay);

    const zipDataFile = await exists(
      ZipBackupName.DATA,
      false,
      backupFolder.id,
    );
    const zipDownloadFile = await exists(
      ZipBackupName.DOWNLOAD,
      false,
      backupFolder.id,
    );
    if (!zipDataFile || !zipDownloadFile) {
      throw new Error(getString('backupScreen.invalidBackupFolder'));
    }
    await BackgroundService.updateNotification({
      taskDesc: getString('backupScreen.downloadingData'),
      progressBar: {
        indeterminate: true,
        value: 0,
        max: 3,
      },
    })
      .then(() => download(zipDataFile, CACHE_DIR_PATH))
      .then(() => sleep(delay))
      .then(() =>
        BackgroundService.updateNotification({
          taskDesc: getString('backupScreen.restoringData'),
          progressBar: {
            indeterminate: true,
            value: 1,
            max: 3,
          },
        }),
      )
      .then(() => restoreData(CACHE_DIR_PATH))
      .then(() => sleep(delay))
      .then(() =>
        BackgroundService.updateNotification({
          taskDesc: getString('backupScreen.downloadingDownloadedFiles'),
          progressBar: {
            indeterminate: true,
            value: 2,
            max: 3,
          },
        }),
      )
      .then(() => download(zipDownloadFile, AppDownloadFolder))
      .then(() => {
        return Notifications.scheduleNotificationAsync({
          content: {
            title: getString('backupScreen.drive.restore'),
            body: getString('common.done'),
          },
          trigger: null,
        });
      })
      .catch(error => {
        throw error;
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
    taskTitle: getString('backupScreen.drive.restore'),
    taskDesc: getString('common.preparing'),
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
