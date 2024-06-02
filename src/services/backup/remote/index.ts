import { MMKVStorage } from '@utils/mmkv/mmkv';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { download, upload } from '@api/remote';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { getString } from '@strings/translations';
import { CACHE_DIR_PATH, prepareBackupData, restoreData } from '../utils';
import { ZipBackupName } from '../types';
import { getAppStorages } from '@utils/Storages';

interface TaskData {
  delay: number;
  host: string;
  backupFolder: string;
}

const remoteBackupAction = async (taskData?: TaskData) => {
  try {
    const { ROOT_STORAGE } = getAppStorages();
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.BACKUP);
    if (!taskData) {
      throw new Error(getString('backupScreen.noDataProvided'));
    }
    const { delay, backupFolder, host } = taskData;
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
      .then(() =>
        upload(host, backupFolder, ZipBackupName.DATA, CACHE_DIR_PATH),
      )
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
      .then(() => sleep(delay))
      .then(() =>
        upload(host, backupFolder, ZipBackupName.DOWNLOAD, ROOT_STORAGE),
      )
      .then(() => {
        return Notifications.scheduleNotificationAsync({
          content: {
            title: getString('backupScreen.remote.backup'),
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
          title: getString('backupScreen.remote.backupInterruped'),
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
    taskTitle: getString('backupScreen.remote.backup'),
    taskDesc: getString('common.preparing'),
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 200, backupFolder, host },
    linkingURI: 'lnreader://updates',
  }).catch((e: Error) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: getString('backupScreen.remote.backupInterruped'),
        body: e.message,
      },
      trigger: null,
    });
    BackgroundService.stop();
  });
};

const remoteRestoreAction = async (taskData?: TaskData) => {
  try {
    const { ROOT_STORAGE } = getAppStorages();
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.RESTORE);
    if (!taskData) {
      throw new Error(getString('backupScreen.noDataProvided'));
    }
    const { delay, backupFolder, host } = taskData;
    await BackgroundService.updateNotification({
      taskDesc: getString('backupScreen.downloadingData'),
      progressBar: {
        indeterminate: true,
        value: 0,
        max: 3,
      },
    })
      .then(() =>
        download(host, backupFolder, ZipBackupName.DATA, CACHE_DIR_PATH),
      )
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
      .then(() => sleep(delay))
      .then(() => restoreData(CACHE_DIR_PATH))
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
      .then(() => sleep(delay))
      .then(() =>
        download(host, backupFolder, ZipBackupName.DOWNLOAD, ROOT_STORAGE),
      )
      .then(() =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: getString('backupScreen.remote.restore'),
            body: getString('common.done'),
          },
          trigger: null,
        }),
      )
      .catch(error => {
        throw error;
      });
  } catch (error: any) {
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getString('backupScreen.remote.restoreInterruped'),
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
    taskTitle: getString('backupScreen.remote.restore'),
    taskDesc: getString('common.preparing'),
    taskIcon: { name: 'notification_icon', type: 'drawable' },
    color: '#00adb5',
    parameters: { delay: 200, backupFolder, host },
    linkingURI: 'lnreader://updates',
  }).catch((e: Error) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: getString('backupScreen.remote.restoreInterruped'),
        body: e.message,
      },
      trigger: null,
    });
    BackgroundService.stop();
  });
};
