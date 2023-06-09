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
  themeTask,
} from './backupTasks';
import {
  restoreCategory,
  restoreChapter,
  restoreDownload,
  restoreImage,
  restoreNovel,
  restoreNovelCategory,
  restorePlugin,
  restoreSetting,
  restoreTheme,
} from './restoreTasks';
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
        themeTask,
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
        // get next task if current task is done (all subtasks is finised)
        while (
          state.currentTaskIndex < state.taskList.length - 1 &&
          state.currentSubtaskIndex === state.subtaskList.length
        ) {
          state.currentTaskIndex += 1;
          const { taskType, subtasks } = await state.taskList[
            state.currentTaskIndex
          ]();
          state.taskType = taskType;
          state.subtaskList = subtasks;
          state.currentSubtaskIndex = 0;
        }
        // the last task is finished
        if (state.currentSubtaskIndex === state.subtaskList.length) {
          return undefined;
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
      ws.onerror = e => {
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
            ws.send(
              JSON.stringify({
                type: 'Metadata',
              }),
            );
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
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Remote Backup Failed',
          body: error.message,
        },
        trigger: null,
      });
      await BackgroundService.stop();
    }
  }
};

export const remoteRestore = async (ipv4: string, port: string) => {
  try {
    const options = {
      taskName: 'Remote Restore',
      taskTitle: 'Remote Restore',
      taskDesc: 'Preparing',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 1000 },
      linkingURI: 'lnreader://updates',
    };

    const remoteRestoreBackgroundAction = async (taskData: any) => {
      const taskMap: Record<
        string,
        (responsePackage: ResponsePackage) => Promise<void>
      > = {
        'Category': restoreCategory,
        'Novel': restoreNovel,
        'NovelCategory': restoreNovelCategory,
        'Chapter': restoreChapter,
        'Download': restoreDownload,
        'Image': restoreImage,
        'Plugin': restorePlugin,
        'Setting': restoreSetting,
        'Theme': restoreTheme,
      };
      const state = {
        error: false,
        index: 0,
        finised: false,
      };

      const ws = new WebSocket(`ws://${ipv4}:${port}`);
      ws.onopen = async () => {
        showToast('Connected');
        ws.send(
          JSON.stringify({
            type: 'Restore',
            data: {
              index: state.index,
            },
          }),
        );
      };
      ws.onerror = (e: any) => {
        state.error = true;
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Remote Restore Failed',
            body: e.message,
          },
          trigger: null,
        });
        ws.close();
      };
      ws.onmessage = async e => {
        const res = JSON.parse(e.data) as ResponsePackage;
        if (res.success) {
          state.index += 1;
          await BackgroundService.updateNotification({
            taskDesc: `Restore ${res.taskType} (${state.index}/${res.total})`,
            progressBar: {
              max: res.total as number,
              value: state.index,
            },
          });
          if (res.taskType && res.taskType in taskMap) {
            await taskMap[res.taskType](res);
          }
          if (state.index === res.total) {
            state.finised = true;
            ws.send(
              JSON.stringify({
                type: 'Restore',
                data: {
                  finished: true,
                },
              }),
            );
            ws.close();
          } else {
            ws.send(
              JSON.stringify({
                type: 'Restore',
                data: {
                  index: state.index,
                },
              }),
            );
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
              title: 'Remote Restore',
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

    await BackgroundService.start(remoteRestoreBackgroundAction, options);
  } catch (error: any) {
    if (BackgroundService.isRunning()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Remote Backup Failed',
          body: error.message,
        },
        trigger: null,
      });
      await BackgroundService.stop();
    }
  }
};
