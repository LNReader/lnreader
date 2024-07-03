import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';

import { getMMKVObject, setMMKVObject } from '@utils/mmkv/mmkv';
import { importEpub } from './epub/import';
import { getString } from '@strings/translations';

type Task = {
  name: 'IMPORT_EPUB';
  data: {
    filename: string;
    uri: string;
  };
};

export default class ServiceManager {
  private STORE_KEY = 'BACKGROUND_ACTION';
  private static instance?: ServiceManager;
  private isRunning: boolean;
  private constructor() {
    this.isRunning = false;
  }
  static get manager() {
    if (!this.instance) {
      this.instance = new ServiceManager();
    }
    return this.instance;
  }
  start() {
    if (!this.isRunning) {
      BackgroundService.start(ServiceManager.lauch, {
        taskName: 'app_services',
        taskTitle: 'App Service',
        taskDesc: getString('common.preparing'),
        taskIcon: { name: 'notification_icon', type: 'drawable' },
        color: '#00adb5',
        linkingURI: 'lnreader://',
      }).catch(error => {
        Notifications.scheduleNotificationAsync({
          content: {
            title: getString('backupScreen.drive.backupInterruped'),
            body: error.message,
          },
          trigger: null,
        });
        BackgroundService.stop();
        this.isRunning = false;
      });
    }
  }
  async executeTask(task: Task): Promise<void> {
    switch (task.name) {
      case 'IMPORT_EPUB':
        return importEpub(task.data);
      default:
        return;
    }
  }

  static async lauch() {
    // retrieve class instance because this is running in different context
    const manager = ServiceManager.manager;
    const doneTasks: Record<Task['name'], number> = {
      'IMPORT_EPUB': 0,
    };
    manager.isRunning = true;
    while (true) {
      const currentTask = manager.getTaskList()[0];
      if (!currentTask) {
        break;
      }
      try {
        await manager.executeTask(currentTask);
        doneTasks[currentTask.name] += 1;
      } catch (error: any) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: currentTask.name,
            body: error?.message || String(error),
          },
          trigger: null,
        });
      } finally {
        setMMKVObject(manager.STORE_KEY, manager.getTaskList().slice(1));
      }
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Background tasks done',
        body: Object.keys(doneTasks)
          .map(key => `${key}: ${doneTasks[key as Task['name']]}`)
          .join('\n'),
      },
      trigger: null,
    });
    manager.stop();
  }
  getTaskList() {
    return getMMKVObject<Array<Task>>(this.STORE_KEY) || [];
  }
  addTask(tasks: Task | Task[]) {
    setMMKVObject(this.STORE_KEY, this.getTaskList().concat(tasks));
    this.start();
  }
  removeTasksByName(name: string) {
    const taskList = this.getTaskList();
    if (taskList[0]?.name === name) {
      this.pause();
      setMMKVObject(
        this.STORE_KEY,
        taskList.filter(t => t.name !== name),
      );
      this.resume();
    } else {
      setMMKVObject(
        this.STORE_KEY,
        taskList.filter(t => t.name !== name),
      );
    }
  }
  clearTaskList() {
    setMMKVObject(this.STORE_KEY, []);
  }
  pause() {
    this.isRunning = false;
    BackgroundService.stop();
  }
  resume() {
    this.start();
  }
  stop() {
    BackgroundService.stop();
    this.isRunning = false;
    this.clearTaskList();
  }
}
