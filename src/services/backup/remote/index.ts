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
  versionTask,
} from './backupTasks';
import {
  checkAppVersion,
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
        versionTask,
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
      const getNextRequestData = async () => {
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
        const requestData = await state.subtaskList[
          state.currentSubtaskIndex
        ]();
        state.currentSubtaskIndex += 1;
        await BackgroundService.updateNotification({
          taskDesc: `Backup ${state.taskType} (${state.currentSubtaskIndex}/${state.subtaskList.length})`,
          progressBar: {
            max: state.subtaskList.length,
            value: state.currentSubtaskIndex,
          },
        });
        return requestData;
      };

      const ws = new WebSocket(`ws://${ipv4}:${port}`);
      ws.onopen = () => {
        showToast('Connected');
        getNextRequestData().then(data => {
          if (data) {
            ws.send(
              JSON.stringify({
                type: RequestType.Backup,
                data: data,
              }),
            );
          } else {
            ws.close();
          }
        });
      };
      ws.onerror = e => {
        state.error = true;
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Remote Backup Interrupted',
            body: e.message,
          },
          trigger: null,
        });
        ws.close();
      };
      ws.onmessage = async e => {
        const response = JSON.parse(e.data) as ResponsePackage;
        if (response.success) {
          getNextRequestData()
            .then(data => {
              if (data) {
                ws.send(
                  JSON.stringify({
                    type: RequestType.Backup,
                    data: data,
                  }),
                );
              } else {
                ws.send(JSON.stringify({ type: 'Metadata' }));
                ws.close();
              }
            })
            .catch(error => {
              state.error = true;
              ws.close();
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Remote Backup Interrupted',
                  body: error.message,
                },
                trigger: null,
              });
            });
        } else {
          state.error = true;
          ws.close();
        }
      };
      ws.onclose = async () => {
        if (!state.error) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Remote backup',
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
          title: 'Remote Backup Interruped',
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
        'Version': checkAppVersion,
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
            data: { index: state.index },
          }),
        );
      };
      ws.onerror = (e: any) => {
        state.error = true;
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Remote Restore Interrupted',
            body: e.message,
          },
          trigger: null,
        });
        ws.close();
      };
      ws.onmessage = async e => {
        const response = JSON.parse(e.data) as ResponsePackage;
        if (response.success) {
          state.index += 1;
          await BackgroundService.updateNotification({
            taskDesc: `Restore ${response.taskType} (${state.index}/${response.total})`,
            progressBar: {
              max: response.total as number,
              value: state.index,
            },
          });
          if (response.taskType && response.taskType in taskMap) {
            taskMap[response.taskType](response)
              .then(() => {
                if (state.index === response.total) {
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
                      data: { index: state.index },
                    }),
                  );
                }
              })
              .catch(error => {
                state.error = true;
                ws.close();
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Remote Restore Interrupted',
                    body: error.message,
                  },
                  trigger: null,
                });
              });
          }
        } else {
          state.error = true;
          ws.close();
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
          title: 'Remote Backup Interrupted',
          body: error.message,
        },
        trigger: null,
      });
      await BackgroundService.stop();
    }
  }
};
