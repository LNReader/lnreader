import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework } from 'expo-file-system';
import moment from 'moment';

import { showToast } from '../../hooks/showToast';

import {
  getLibraryChapters,
  getLibraryDownloads,
  getLibraryNovels,
  restoreChapters,
  restoreDownloads,
  restoreNovels,
} from './BackupQueries';

const createFullBackup = async () => {
  const novels = await getLibraryNovels();
  const chapters = await getLibraryChapters();
  const downloads = await getLibraryDownloads();

  const backup = { novels, chapters, downloads };

  /**
   * Request permissions
   */
  const permissions =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) {
    return;
  }

  const uri = permissions.directoryUri;

  const date = moment().format('YYYY-MM-DD');

  const fileName = 'lnreader_backup_' + date;

  if (uri) {
    const fileUri = await StorageAccessFramework.createFileAsync(
      uri,
      fileName,
      'application/json',
    );

    await StorageAccessFramework.writeAsStringAsync(
      fileUri,
      JSON.stringify(backup),
    );

    showToast('Backup created.');
  }
};

const restoreFullBackup = async () => {
  const backup = await DocumentPicker.getDocumentAsync();

  if (backup.uri) {
    let data = await StorageAccessFramework.readAsStringAsync(backup.uri);
    data = JSON.parse(data);

    const { novels, chapters, downloads } = data;

    novels.map(novel => restoreNovels(novel));
    chapters.map(chapter => restoreChapters(chapter));
    downloads.map(chapter => restoreDownloads(chapter));
  }

  showToast('Backup restored.');
};

export { createFullBackup, restoreFullBackup };
