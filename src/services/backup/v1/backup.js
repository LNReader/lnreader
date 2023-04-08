import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework } from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';
import RNFS from 'react-native-fs';

import { getPlugin } from '@plugins/pluginManager';
import { restoreLibrary } from '@database/queries/NovelQueries';
import { getLibraryNovelsFromDb } from '@database/queries/LibraryQueries';
import { showToast } from '@hooks/showToast';
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

export const restoreBackup = async filePath => {
  try {
    let backup = {};
    if (!filePath) {
      backup = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
      });
    }
    let novels = '';

    if (backup.uri) {
      novels = await StorageAccessFramework.readAsStringAsync(backup.uri);
    } else if (filePath) {
      if (!(await RNFS.exists(filePath))) {
        showToast("There's no error novel");
        return; //neither backup nor error backup
      }
      novels = await RNFS.readFile(filePath);
    }

    novels = await JSON.parse(novels);
    if (novels.length === 0) {
      showToast("There's no available backup");
      return;
    }
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
        const errorNovels = [];
        for (
          let i = 0;
          BackgroundService.isRunning() && i < novels.length;
          i++
        ) {
          try {
            if (BackgroundService.isRunning()) {
              const plugin = getPlugin(novels[i].pluginId);
              if (!plugin) {
                showToast(`Plugin with id ${novels[i].pluginId} doenst exist!`);
                errorNovels.push(novels[i]);
                continue;
              }
              await restoreLibrary(novels[i]);
              await BackgroundService.updateNotification({
                taskTitle: novels[i].name,
                taskDesc: '(' + (i + 1) + '/' + novels.length + ')',
                progressBar: { max: novels.length, value: i + 1 },
              });

              if (novels.length === i + 1) {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Library Restored',
                    body: novels.length + ' novels restored',
                  },
                  trigger: null,
                });
                resolve();
              }

              const nextNovelIndex = i + 1;

              if (
                nextNovelIndex in novels &&
                novels[nextNovelIndex].pluginId === novels[i].pluginId
              ) {
                await sleep(taskData.delay);
              }
            }
          } catch (error) {
            showToast(novels[i].name + ': ' + error.message);
            errorNovels.push(novels[i]);
            continue;
          }
        }
        const errorPath = RNFS.ExternalDirectoryPath + '/errorNovels.json';
        if (errorNovels.length > 0) {
          await RNFS.writeFile(errorPath, JSON.stringify(errorNovels));
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Library Restored',
              body:
                errorNovels.length +
                ' novels got errors. Please use Restore error backup to try again.',
            },
            trigger: null,
          });
          resolve();
        } else {
          RNFS.exists(errorPath).then(exist => {
            if (exist) {
              RNFS.unlink(errorPath);
            }
          });
        }
      });

    if (novels.length > 0) {
      await BackgroundService.start(
        restoreBackupBackgroundAction,
        notificationOptions,
      );
    }
  } catch (error) {
    showToast(error.message);
  }
};

export const restoreError = async () => {
  const errorPath = RNFS.ExternalDirectoryPath + '/errorNovels.json';
  restoreBackup(errorPath);
};
