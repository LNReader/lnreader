import { showToast } from '@utils/showToast';
import dayjs from 'dayjs';
import {
  saveDocuments,
  pick,
  types,
  keepLocalCopy,
} from '@react-native-documents/picker';
import { CACHE_DIR_PATH, prepareBackupData, restoreData } from '../utils';
import NativeZipArchive from '@specs/NativeZipArchive';
import { ROOT_STORAGE } from '@utils/Storages';
import { ZipBackupName } from '../types';
import NativeFile from '@specs/NativeFile';
import { getString } from '@strings/translations';

export const createBackup = async () => {
  try {
    await prepareBackupData(CACHE_DIR_PATH);

    await NativeZipArchive.zip(
      ROOT_STORAGE,
      CACHE_DIR_PATH + '/' + ZipBackupName.DOWNLOAD,
    );
    await NativeZipArchive.zip(CACHE_DIR_PATH, CACHE_DIR_PATH + '.zip');

    const datetime = dayjs().format('YYYY-MM-DD_HH_mm');
    const fileName = 'lnreader_backup_' + datetime + '.zip';

    await saveDocuments({
      sourceUris: ['file://' + CACHE_DIR_PATH + '.zip'],
      copy: false,
      mimeType: 'application/zip',
      fileName,
    });

    showToast(getString('backupScreen.backupCreated'));
  } catch (error: any) {
    showToast(error.message);
  }
};

export const restoreBackup = async () => {
  try {
    const [result] = await pick({
      mode: 'import',
      type: [types.zip],
      allowVirtualFiles: true, // TODO: hopefully this just works
    });

    if (NativeFile.exists(CACHE_DIR_PATH)) {
      NativeFile.unlink(CACHE_DIR_PATH);
    }

    const [localRes] = await keepLocalCopy({
      files: [
        {
          uri: result.uri,
          fileName: 'backup.zip',
        },
      ],
      destination: 'cachesDirectory',
    });
    if (localRes.status === 'error') {
      throw new Error(localRes.copyError);
    }

    const localPath = localRes.localUri.replace(/^file:(\/\/)?\//, '/');

    // TODO: error handling

    await NativeZipArchive.unzip(localPath, CACHE_DIR_PATH);
    // TODO: unlink here too?
    await NativeZipArchive.unzip(
      CACHE_DIR_PATH + '/' + ZipBackupName.DOWNLOAD,
      ROOT_STORAGE,
    );

    await restoreData(CACHE_DIR_PATH);

    showToast(getString('backupScreen.backupRestored'));
  } catch (error: any) {
    showToast(error.message);
  }
};
