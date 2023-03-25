import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework } from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

import { restoreLibrary } from '../../../database/queries/NovelQueries';
import { getLibraryNovelsFromDb } from '../../../database/queries/LibraryQueries';
import { showToast } from '../../../hooks/showToast';
import dayjs from 'dayjs';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

export const createBackup = async () => {
  try {
    const novels = await getLibraryNovelsFromDb();

    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return;
    }

    const uri = permissions.directoryUri;

    const datetime = dayjs().format('YYYY-MM-DD_HH:mm');

    const fileName = 'lnreader_backup_' + datetime;

    if (uri) {
      const fileUri = await StorageAccessFramework.createFileAsync(
        uri,
        fileName,
        'application/json',
      );

      await StorageAccessFramework.writeAsStringAsync(
        fileUri,
        JSON.stringify(novels),
      );

      showToast(`Backup created ${fileName}`);
    }
  } catch (error) {
    showToast(error.message);
  }
};

export const restoreBackup = async () => {
  try {
    const backup = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (backup.uri) {
      let novels = await StorageAccessFramework.readAsStringAsync(backup.uri);
      novels = await JSON.parse(novels);

      const notificationOptions = {
        taskName: 'Backup Restore',
        taskTitle: 'Restoring backup',
        taskDesc: '(0/' + novels.length + ')',
        taskIcon: { name: 'notification_icon', type: 'drawable' },
        color: '#00adb5',
        parameters: { delay: 1000 },
        linkingURI: 'lnreader://updates',
        progressBar: { max: novels.length, value: 0 },
      };

      const restoreBackupBackgroundAction = async taskData =>
        await new Promise(async resolve => {
          for (
            let i = 0;
            BackgroundService.isRunning() && i < novels.length;
            i++
          ) {
            try {
              if (BackgroundService.isRunning()) {
                await restoreLibrary(novels[i]);

                await BackgroundService.updateNotification({
                  taskTitle: novels[i].novelName,
                  taskDesc: '(' + (i + 1) + '/' + novels.length + ')',
                  progressBar: { max: novels.length, value: i + 1 },
                });

                if (novels.length === i + 1) {
                  resolve();

                  Notifications.scheduleNotificationAsync({
                    content: {
                      title: 'Library Restored',
                      body: novels.length + ' novels restored',
                    },
                    trigger: null,
                  });
                }

                const nextNovelIndex = i + 1;

                if (
                  nextNovelIndex in novels &&
                  novels[nextNovelIndex].sourceId === novels[i].sourceId
                ) {
                  await sleep(taskData.delay);
                }
              }
            } catch (error) {
              showToast(novels[i].novelName + ': ' + error.message);
              continue;
            }
          }
        });

      if (novels.length > 0) {
        await BackgroundService.start(
          restoreBackupBackgroundAction,
          notificationOptions,
        );
      }
    }
  } catch (error) {
    showToast(error.message);
  }
};
