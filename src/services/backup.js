import * as DocumentPicker from 'expo-document-picker';
import {StorageAccessFramework} from 'expo-file-system';

import {restoreLibrary} from '../database/queries/NovelQueries';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export const restoreBackup = async () => {
  const backup = await DocumentPicker.getDocumentAsync();

  Notifications.scheduleNotificationAsync({
    content: {title: 'Restoring backup'},
    trigger: null,
  });

  if (backup.uri) {
    let novels = await StorageAccessFramework.readAsStringAsync(backup.uri);
    novels = await JSON.parse(novels);

    novels.map((novel, index) => {
      setTimeout(async () => {
        if (index + 1 === novels.length) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Library Restored',
              body: novels.length + ' novels restored',
            },
            trigger: null,
          });
        }

        await restoreLibrary(novel);
      }, 1000 * index);
    });
  }
};
