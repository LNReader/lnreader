import { showToast } from '@hooks/showToast';
import {
  BackupTask,
  RequestPackage,
  categoryTask,
  novelTask,
  novelCoverTask,
  novelCategoryTask,
  chapterTask,
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
      .then(res => res.json())
      .then(resObj => resolve(resObj))
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

    const remoteBackupBackgroundAction = (): Promise<void> => {
      const allTasks: Array<() => Promise<BackupTask>> = [
        categoryTask,
        novelTask,
        novelCoverTask,
        novelCategoryTask,
        chapterTask,
      ];
      return new Promise(async resolve => {
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
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Remote Backup Failed',
                  body: response.message,
                },
                trigger: null,
              });
              BackgroundService.stop();
              resolve();
            }
          }
        };
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
      });
    };
    BackgroundService.start(remoteBackupBackgroundAction, options);
  } catch (error: any) {
    showToast(error.message);
  }
};
