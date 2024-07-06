import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import { download, upload } from '@api/remote';
import { getString } from '@strings/translations';
import { CACHE_DIR_PATH, prepareBackupData, restoreData } from '../utils';
import { ZipBackupName } from '../types';
import { ROOT_STORAGE } from '@utils/Storages';

export interface SelfHostData {
  host: string;
  backupFolder: string;
}

export const createSelfHostBackup = ({ host, backupFolder }: SelfHostData) => {
  return BackgroundService.updateNotification({
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
    .then(() => sleep(200))
    .then(() => upload(host, backupFolder, ZipBackupName.DATA, CACHE_DIR_PATH))
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
    .then(() => sleep(200))
    .then(() =>
      upload(host, backupFolder, ZipBackupName.DOWNLOAD, ROOT_STORAGE),
    );
};

export const selfHostRestore = ({ host, backupFolder }: SelfHostData) => {
  return BackgroundService.updateNotification({
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
    .then(() => sleep(200))
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
    .then(() => sleep(200))
    .then(() =>
      download(host, backupFolder, ZipBackupName.DOWNLOAD, ROOT_STORAGE),
    );
};
