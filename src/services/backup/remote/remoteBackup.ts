import { showToast } from '@hooks/showToast';
import {
  categoryTask,
  novelTask,
  novelCoverTask,
  novelCategoryTask,
  chapterTask,
  downloadTask,
  imageTask,
  pluginTask,
  settingTask,
} from './backupTasks';
import {
  RequestType,
  RequestPackage,
  ResponsePackage,
  BackupTask,
} from './types';
import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';
import { sleep } from '@utils/sleep';

export const remoteBackup = async (ipv4: string, port: string) => {
  try {
    const options = {
      taskName: 'Remote Backup',
      taskTitle: 'Remote Backup',
      taskDesc: 'Preparing',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 1000 },
      linkingURI: 'lnreader://updates',
    };

    const remoteBackupBackgroundAction = async (taskData: any) => {
      const taskList: Array<() => Promise<BackupTask>> = [
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
      const state = {
        error: false,
        taskList: taskList,
        subtaskList: [] as Array<() => Promise<RequestPackage>>,
        currentTaskIndex: -1,
        currentSubtaskIndex: 0,
        taskType: '',
        finised: false,
      };
      const getNextRequest = async () => {
        if (state.currentSubtaskIndex === state.subtaskList.length) {
          state.currentTaskIndex += 1;
          if (state.currentTaskIndex === state.taskList.length) {
            return undefined;
          }
          const { taskType, subtasks } = await state.taskList[
            state.currentTaskIndex
          ]();
          state.taskType = taskType;
          state.subtaskList = subtasks;
          state.currentSubtaskIndex = 0;
        }
        const req = await state.subtaskList[state.currentSubtaskIndex]();
        state.currentSubtaskIndex += 1;
        await BackgroundService.updateNotification({
          taskDesc: `Backup ${state.taskType} (${state.currentSubtaskIndex}/${state.subtaskList.length})`,
          progressBar: {
            max: state.subtaskList.length,
            value: state.currentSubtaskIndex,
          },
        });
        return req;
      };
      const ws = new WebSocket(`ws://${ipv4}:${port}`);
      ws.onopen = async () => {
        showToast('Connected');
        const req = await getNextRequest();
        if (req) {
          ws.send(
            JSON.stringify({
              type: RequestType.Backup,
              data: req,
            }),
          );
        } else {
          ws.close();
        }
      };
      ws.onerror = (e: any) => {
        state.error = true;
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Remote Backup Failed',
            body: e.message,
          },
          trigger: null,
        });
        ws.close();
      };
      ws.onmessage = async e => {
        const res = JSON.parse(e.data) as ResponsePackage;
        if (res.success) {
          const req = await getNextRequest();
          if (req) {
            ws.send(
              JSON.stringify({
                type: RequestType.Backup,
                data: req,
              }),
            );
          } else {
            ws.close();
          }
        } else {
          state.error = true;
          throw new Error(res.message);
        }
      };
      ws.onclose = async () => {
        if (!state.error) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Remote Backup',
              body: 'Done!',
            },
            trigger: null,
          });
        }
        state.finised = true;
      };

      // this keeps Background service running
      while (!state.finised) {
        await sleep(taskData.delay);
      }
    };

    await BackgroundService.start(remoteBackupBackgroundAction, options);
  } catch (error: any) {
    showToast(error.message);
  }
};
