import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';

import { getMMKVObject, setMMKVObject } from '@utils/mmkv/mmkv';
import { importEpub } from './epub/import';
import { getString } from '@strings/translations';
import { updateLibrary } from './updates';
import { DriveFile } from '@api/drive/types';
import { createDriveBackup, driveRestore } from './backup/drive';
import {
  createSelfHostBackup,
  SelfHostData,
  selfHostRestore,
} from './backup/selfhost';
import { migrateNovel, MigrateNovelData } from './migrate/migrateNovel';
import { downloadChapter } from './download/downloadChapter';
import { askForPostNotificationsPermission } from '@utils/askForPostNoftificationsPermission';

type taskNames =
  | 'IMPORT_EPUB'
  | 'UPDATE_LIBRARY'
  | 'DRIVE_BACKUP'
  | 'DRIVE_RESTORE'
  | 'SELF_HOST_BACKUP'
  | 'SELF_HOST_RESTORE'
  | 'MIGRATE_NOVEL'
  | 'DOWNLOAD_CHAPTER';

export type BackgroundTask =
  | {
      name: 'IMPORT_EPUB';
      data: {
        filename: string;
        uri: string;
      };
    }
  | {
      name: 'UPDATE_LIBRARY';
      data?: {
        categoryId?: number;
        categoryName?: string;
      };
    }
  | { name: 'DRIVE_BACKUP'; data: DriveFile }
  | { name: 'DRIVE_RESTORE'; data: DriveFile }
  | { name: 'SELF_HOST_BACKUP'; data: SelfHostData }
  | { name: 'SELF_HOST_RESTORE'; data: SelfHostData }
  | { name: 'MIGRATE_NOVEL'; data: MigrateNovelData }
  | DownloadChapterTask;
export type DownloadChapterTask = {
  name: 'DOWNLOAD_CHAPTER';
  data: { chapterId: number; novelName: string; chapterName: string };
};

export type BackgroundTaskMetadata = {
  name: string;
  isRunning: boolean;
  progress: number | undefined;
  progressText: string | undefined;
};

export type QueuedBackgroundTask = {
  task: BackgroundTask;
  meta: BackgroundTaskMetadata;
  id: string;
};

function makeId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export default class ServiceManager {
  STORE_KEY = 'APP_SERVICE';
  lastNotifUpdate = 0;
  currentPendingUpdate = 0;
  private static instance?: ServiceManager;

  private constructor() {}

  static get manager() {
    if (!this.instance) {
      this.instance = new ServiceManager();
    }
    return this.instance;
  }

  get isRunning() {
    return BackgroundService.isRunning();
  }

  isMultiplicableTask(task: BackgroundTask) {
    return (
      ['DOWNLOAD_CHAPTER', 'IMPORT_EPUB', 'MIGRATE_NOVEL'] as Array<
        BackgroundTask['name']
      >
    ).includes(task.name);
  }

  async start() {
    if (!this.isRunning) {
      const notificationsAllowed = await askForPostNotificationsPermission();
      if (!notificationsAllowed) return;
      BackgroundService.start(ServiceManager.launch, {
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
      });
    }
  }

  setMeta(
    transformer: (meta: BackgroundTaskMetadata) => BackgroundTaskMetadata,
  ) {
    const taskList = [...this.getTaskList()];
    taskList[0] = {
      ...taskList[0],
      meta: transformer(taskList[0].meta),
    };

    if (
      taskList[0].meta.isRunning &&
      taskList[0].task.name !== 'DOWNLOAD_CHAPTER'
    ) {
      const now = Date.now();
      if (now - this.lastNotifUpdate > 1000) {
        const delay = 1000 - now - this.lastNotifUpdate;
        const id = ++this.currentPendingUpdate;
        setTimeout(() => {
          if (this.currentPendingUpdate !== id) {
            return;
          }
          BackgroundService.updateNotification({
            taskTitle: taskList[0].meta.name,
            taskDesc: taskList[0].meta.progressText ?? '',
            progressBar: {
              indeterminate: taskList[0].meta.progress === undefined,
              value: (taskList[0].meta.progress || 0) * 100,
              max: 100,
            },
          });
        }, delay);
      } else {
        this.lastNotifUpdate = now;
        BackgroundService.updateNotification({
          taskTitle: taskList[0].meta.name,
          taskDesc: taskList[0].meta.progressText ?? '',
          progressBar: {
            indeterminate: taskList[0].meta.progress === undefined,
            value: (taskList[0].meta.progress || 0) * 100,
            max: 100,
          },
        });
      }
    }

    setMMKVObject(this.STORE_KEY, taskList);
  }

  //gets the progress bar for download chapters notification
  getProgressForNotification(
    currentTask: QueuedBackgroundTask,
    startingTasks: QueuedBackgroundTask[],
  ) {
    let i = null;
    let count = 0;
    for (const task of startingTasks) {
      if (
        task.task.name === 'DOWNLOAD_CHAPTER' &&
        task.meta.name === currentTask.meta.name
      ) {
        if (task.id === currentTask.id) {
          i = count;
        }
        count++;
      } else {
        if (i !== null) {
          break;
        }
        count = 0;
      }
    }
    if (i === null) {
      return null;
    }
    return (i / count) * 100;
  }

  async executeTask(
    task: QueuedBackgroundTask,
    startingTasks: QueuedBackgroundTask[],
  ) {
    const progress =
      task.task.name === 'DOWNLOAD_CHAPTER'
        ? this.getProgressForNotification(task, startingTasks)
        : null;
    await BackgroundService.updateNotification({
      taskTitle: task.meta.name,
      taskDesc: task.meta.progressText ?? '',
      progressBar: {
        indeterminate: progress === null,
        max: 100,
        value: progress == null ? 0 : progress,
      },
    });
    this.lastNotifUpdate = Date.now();
    this.currentPendingUpdate = 0;

    switch (task.task.name) {
      case 'IMPORT_EPUB':
        return importEpub(task.task.data, this.setMeta.bind(this));
      case 'UPDATE_LIBRARY':
        return updateLibrary(task.task.data || {}, this.setMeta.bind(this));
      case 'DRIVE_BACKUP':
        return createDriveBackup(task.task.data, this.setMeta.bind(this));
      case 'DRIVE_RESTORE':
        return driveRestore(task.task.data, this.setMeta.bind(this));
      case 'SELF_HOST_BACKUP':
        return createSelfHostBackup(task.task.data, this.setMeta.bind(this));
      case 'SELF_HOST_RESTORE':
        return selfHostRestore(task.task.data, this.setMeta.bind(this));
      case 'MIGRATE_NOVEL':
        return migrateNovel(task.task.data, this.setMeta.bind(this));
      case 'DOWNLOAD_CHAPTER':
        return downloadChapter(task.task.data, this.setMeta.bind(this));
    }
  }

  static async launch() {
    // retrieve class instance because this is running in different context
    const manager = ServiceManager.manager;
    const doneTasks: Record<BackgroundTask['name'], number> = {
      'IMPORT_EPUB': 0,
      'UPDATE_LIBRARY': 0,
      'DRIVE_BACKUP': 0,
      'DRIVE_RESTORE': 0,
      'SELF_HOST_BACKUP': 0,
      'SELF_HOST_RESTORE': 0,
      'MIGRATE_NOVEL': 0,
      'DOWNLOAD_CHAPTER': 0,
    };
    const startingTasks = manager.getTaskList();
    const tasksSet = new Set(startingTasks.map(t => t.id));
    while (BackgroundService.isRunning()) {
      const currentTasks = manager.getTaskList();
      const currentTask = currentTasks[0];
      if (!currentTask) {
        break;
      }

      //Add any newly queued tasks to the starting tasks list
      const newtasks = currentTasks.filter(t => !tasksSet.has(t.id));
      startingTasks.push(...newtasks);
      newtasks.forEach(t => tasksSet.add(t.id));

      try {
        await manager.executeTask(currentTask, startingTasks);
        doneTasks[currentTask.task.name] += 1;
      } catch (error: any) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: currentTask.meta.name,
            body: error?.message || String(error),
          },
          trigger: null,
        });
      } finally {
        setMMKVObject(manager.STORE_KEY, manager.getTaskList().slice(1));
      }
    }

    if (manager.getTaskList().length === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Background tasks done',
          body: Object.keys(doneTasks)
            .filter(key => doneTasks[key as BackgroundTask['name']] > 0)
            .map(
              key =>
                `${getString(`notifications.${key as taskNames}`)}: ${
                  doneTasks[key as BackgroundTask['name']]
                }`,
            )
            .join('\n'),
        },
        trigger: null,
      });
    }
  }

  getTaskName(task: BackgroundTask) {
    switch (task.name) {
      case 'DOWNLOAD_CHAPTER':
        return 'Download ' + task.data.novelName;
      case 'IMPORT_EPUB':
        return 'Import Epub ' + task.data.filename;
      case 'MIGRATE_NOVEL':
        return 'Migrate Novel ' + task.data.fromNovel.name;
      case 'UPDATE_LIBRARY':
        if (task.data !== undefined) {
          return 'Update Category ' + task.data.categoryName;
        }
        return 'Update Library';
      case 'DRIVE_BACKUP':
        return 'Drive Backup';
      case 'DRIVE_RESTORE':
        return 'Drive Restore';
      case 'SELF_HOST_BACKUP':
        return 'Self Host Backup';
      case 'SELF_HOST_RESTORE':
        return 'Self Host Restore';
      default:
        return 'Unknown Task';
    }
  }

  getTaskList() {
    return getMMKVObject<Array<QueuedBackgroundTask>>(this.STORE_KEY) || [];
  }

  addTask(tasks: BackgroundTask | BackgroundTask[]) {
    let currentTasks = this.getTaskList();
    // @ts-expect-error Older version can still have tasks with old format
    currentTasks = currentTasks.filter(task => !task?.name);

    const addableTasks = (Array.isArray(tasks) ? tasks : [tasks]).filter(
      task =>
        this.isMultiplicableTask(task) ||
        !currentTasks.some(_t => _t.task.name === task.name),
    );
    if (addableTasks.length) {
      const newTasks: QueuedBackgroundTask[] = addableTasks.map(task => ({
        task,
        meta: {
          name: this.getTaskName(task),
          isRunning: false,
          progress: undefined,
          progressText:
            task.name === 'DOWNLOAD_CHAPTER'
              ? task.data.chapterName
              : undefined,
        },
        id: makeId(),
      }));

      setMMKVObject(this.STORE_KEY, currentTasks.concat(newTasks));
      this.start();
    }
  }

  removeTasksByName(name: BackgroundTask['name']) {
    const taskList = this.getTaskList();
    if (taskList[0]?.task?.name === name) {
      this.pause();
      setMMKVObject(
        this.STORE_KEY,
        taskList.filter(t => t.task.name !== name),
      );
      this.resume();
    } else {
      setMMKVObject(
        this.STORE_KEY,
        taskList.filter(t => t.task.name !== name),
      );
    }
  }

  clearTaskList() {
    setMMKVObject(this.STORE_KEY, []);
  }

  pause() {
    BackgroundService.stop();
  }

  resume() {
    this.start();
  }

  stop() {
    BackgroundService.stop();
    this.clearTaskList();
  }
}
