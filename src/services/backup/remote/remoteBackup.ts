import { showToast } from '@hooks/showToast';
import {
  BackupTask,
  RequestPackage,
  categoryTask,
  novelTask,
  novelCoverTask,
  novelCategoryTask,
  chapterTask,
  downloadTask,
  imageTask,
  pluginTask,
  settingTask,
} from './requests';
import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

export const blockInsert = () => {
  return;
};

interface ResponsePackage {
  success: boolean;
  message: string;
}

const postBackup = (
  ipv4: string,
  port: string,
  data: RequestPackage,
): Promise<ResponsePackage> => {
  return new Promise(resolve => {
    fetch(`http://${ipv4}:${port}/backup`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (
          res.ok &&
          contentType &&
          contentType.indexOf('application/json') !== -1
        ) {
          return res.json();
        } else {
          return res.text();
        }
      })
      .then(resObj => {
        if (resObj instanceof String) {
          resObj = {
            success: false,
            message: resObj,
          };
        }
        resolve(resObj);
      })
      .catch(error => resolve({ success: false, message: error.message }));
  });
};

export const remoteBackup = async (ipv4: string, port: string) => {
  try {
    const options = {
      taskName: 'Remote Backup',
      taskTitle: 'Remote Backup',
      taskDesc: 'Backup Category',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 1000 },
      linkingURI: 'lnreader://updates',
    };

    const remoteBackupBackgroundAction = async () => {
      const allTasks: Array<() => Promise<BackupTask>> = [
        categoryTask,
        novelTask,
        novelCoverTask,
        novelCategoryTask,
        chapterTask,
        downloadTask,
        imageTask,
        pluginTask,
        settingTask,
      ];
      const doTask = async (task: () => Promise<BackupTask>) => {
        const { type, subtasks } = await task();
        for (
          let i = 0;
          BackgroundService.isRunning() && i < subtasks.length;
          i++
        ) {
          const requestPackage = await subtasks[i]();
          const response = await postBackup(ipv4, port, requestPackage);
          if (response.success) {
            await BackgroundService.updateNotification({
              taskDesc: `Backup ${type} (${i + 1}/${subtasks.length})`,
              progressBar: { max: subtasks.length, value: i + 1 },
            });
          } else {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Remote Backup Failed',
                body: response.message,
              },
              trigger: null,
            });
            await BackgroundService.stop();
          }
        }
      };
      try {
        for (let task of allTasks) {
          await doTask(task);
        }
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Remote Backup',
            body: 'Done!',
          },
          trigger: null,
        });
      } catch (error) {
        throw error;
      }
    };

    BackgroundService.start(remoteBackupBackgroundAction, options);
  } catch (error: any) {
    showToast(error.message);
  }
};
