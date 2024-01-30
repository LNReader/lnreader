import { MMKVStorage } from '@utils/mmkv/mmkv';
import RNFS from 'react-native-fs';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { download, upload } from '@api/remote';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { getString } from '@strings/translations';
import { prepareBackupData, restoreData } from '../utils';
import { AppDownloadFolder } from '@utils/constants/download';

interface TaskData {
  delay: number;
  host: string;
  backupFolder: string;
}

const CACHE_DIR_PATH = RNFS.ExternalCachesDirectoryPath + '/BackupData';

const remoteBackupAction = async (taskData?: TaskData) => {
  try {
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.BACKUP);
    if (!taskData) {
      throw new Error('No data provided');
    }
    const { delay, backupFolder, host } = taskData;

    await prepareBackupData(CACHE_DIR_PATH)
      .then(() => sleep(delay))
      .then(() => upload(host, backupFolder, 'data.zip', CACHE_DIR_PATH))
      .then(() => sleep(delay))
      .then(() => upload(host, backupFolder, 'download.zip', AppDownloadFolder))
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
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.RESTORE);
    if (!taskData) {
      throw new Error('No data provided');
    }
    const { delay, backupFolder, host } = taskData;
    await download(host, backupFolder, 'data.zip', CACHE_DIR_PATH);
    await sleep(delay);
    await restoreData(CACHE_DIR_PATH);
    await sleep(delay);
    await download(host, backupFolder, 'download.zip', AppDownloadFolder);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: getString('backupScreen.remote.restore'),
        body: getString('common.done'),
      },
      trigger: null,
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
    taskTitle: 'Self Host Restore',
    taskDesc: 'Preparing',
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
