import { DriveFile } from '@api/drive/types';
import { sleep } from '@utils/sleep';
import BackgroundService from 'react-native-background-actions';
import { exists } from '@api/drive';
import { getString } from '@strings/translations';
import { CACHE_DIR_PATH, prepareBackupData, restoreData } from '../utils';
import { download, updateMetadata, uploadMedia } from '@api/drive/request';
import { ZipBackupName } from '../types';
import { ROOT_STORAGE } from '@utils/Storages';

export const createDriveBackup = (backupFolder: DriveFile) => {
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
    .then(() => sleep(500))
    .then(() => uploadMedia(CACHE_DIR_PATH))
    .then(file =>
      updateMetadata(
        file.id,
        {
          name: ZipBackupName.DATA,
          mimeType: 'application/zip',
          parents: [backupFolder.id],
        },
        file.parents[0],
      ),
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
    .then(() => uploadMedia(ROOT_STORAGE))
    .then(file =>
      updateMetadata(
        file.id,
        {
          name: ZipBackupName.DOWNLOAD,
          mimeType: 'application/zip',
          parents: [backupFolder.id],
        },
        file.parents[0],
      ),
    );
};

export const driveRestore = async (backupFolder: DriveFile) => {
  const zipDataFile = await exists(ZipBackupName.DATA, false, backupFolder.id);
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
    .then(() => sleep(500))
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
    .then(() => sleep(500))
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
    .then(() => download(zipDownloadFile, ROOT_STORAGE));
};
