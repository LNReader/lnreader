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

export type GeneralBackgroundTask =
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
  data: {
    chapterId: number;
    novelName: string;
    novelId: number;
    chapterName: string;
  };
};

export type BackgroundTask<T extends taskNames = taskNames> = Extract<
  GeneralBackgroundTask,
  { name: T }
>;

export type BackgroundTaskMetadata = {
  name: string;
  isRunning: boolean;
  progress: number | undefined;
  progressText: string | undefined;
  finalStatus?: 'completed' | 'failed'; // NEW: Outcome for UI
};

export type QueuedBackgroundTask<T extends taskNames = taskNames> = {
  task: BackgroundTask<T>;
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

  // NEW: Listeners for task completion/failure
  private taskCompletionListeners: Set<(task: QueuedBackgroundTask) => void> =
    new Set();

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

  isMultiplicableTask(task: GeneralBackgroundTask) {
    return (
      ['DOWNLOAD_CHAPTER', 'IMPORT_EPUB', 'MIGRATE_NOVEL'] as Array<
        GeneralBackgroundTask['name']
      >
    ).includes(task.name);
  }

  public addCompletionListener(listener: (task: QueuedBackgroundTask) => void) {
    this.taskCompletionListeners.add(listener);
  }

  public removeCompletionListener(
    listener: (task: QueuedBackgroundTask) => void,
  ) {
    this.taskCompletionListeners.delete(listener);
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
    // Ensure taskList[0] exists before proceeding
    if (!taskList[0]) {
      return;
    }

    const updatedMeta = transformer(taskList[0].meta);
    taskList[0] = {
      ...taskList[0],
      meta: updatedMeta,
    };

    if (updatedMeta.isRunning && taskList[0].task.name !== 'DOWNLOAD_CHAPTER') {
      const now = Date.now();
      if (now - this.lastNotifUpdate > 1000) {
        const delay = Math.max(0, 1000 - (now - this.lastNotifUpdate)); // Ensure positive delay
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

    // Set task to running and update notification before executing
    this.setMeta(prevMeta => ({ ...prevMeta, isRunning: true }));
    await BackgroundService.updateNotification({
      taskTitle: task.meta.name,
      taskDesc: task.meta.progressText ?? '',
      progressBar: {
        indeterminate: progress === null,
        max: 100,
        value: progress === null ? 0 : progress,
      },
    });
    this.lastNotifUpdate = Date.now();
    this.currentPendingUpdate = 0;

    let success = false;
    try {
      switch (task.task.name) {
        case 'IMPORT_EPUB':
          await importEpub(task.task.data, this.setMeta.bind(this));
          break;
        case 'UPDATE_LIBRARY':
          await updateLibrary(task.task.data || {}, this.setMeta.bind(this));
          break;
        case 'DRIVE_BACKUP':
          await createDriveBackup(task.task.data, this.setMeta.bind(this));
          break;
        case 'DRIVE_RESTORE':
          await driveRestore(task.task.data, this.setMeta.bind(this));
          break;
        case 'SELF_HOST_BACKUP':
          await createSelfHostBackup(task.task.data, this.setMeta.bind(this));
          break;
        case 'SELF_HOST_RESTORE':
          await selfHostRestore(task.task.data, this.setMeta.bind(this));
          break;
        case 'MIGRATE_NOVEL':
          await migrateNovel(task.task.data, this.setMeta.bind(this));
          break;
        case 'DOWNLOAD_CHAPTER':
          await downloadChapter(task.task.data, this.setMeta.bind(this));
          break;
      }
      success = true;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(`Task ${task.task.name} (ID: ${task.id}) failed:`, error);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Failed: ${task.meta.name}`,
          body: error?.message || String(error),
        },
        trigger: null,
      });
    } finally {
      //? Notify listeners about task completion/failure
      const finalTask: QueuedBackgroundTask = {
        ...task,
        meta: {
          ...task.meta,
          isRunning: false,
          finalStatus: success ? 'completed' : 'failed',
          progress: success ? 100 : undefined,
          progressText: success ? getString('common.done') : 'Failed',
        },
      };
      this.taskCompletionListeners.forEach(listener => listener(finalTask));
    }
  }

  static async launch() {
    // retrieve class instance because this is running in different context
    const manager = ServiceManager.manager;
    const doneTasks: Record<GeneralBackgroundTask['name'], number> = {
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

    while (BackgroundService.isRunning()) {
      const currentTasks = manager.getTaskList();
      const currentTask = currentTasks[0];

      if (!currentTask) {
        break;
      }

      await manager.executeTask(currentTask, startingTasks);

      // After execution, remove the current task from the queue
      setMMKVObject(manager.STORE_KEY, currentTasks.slice(1));
      doneTasks[currentTask.task.name] += 1;
    }

    // Final notification when all tasks are done
    if (manager.getTaskList().length === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Background tasks done',
          body: Object.keys(doneTasks)
            .filter(key => doneTasks[key as GeneralBackgroundTask['name']] > 0)
            .map(
              key =>
                `${getString(`notifications.${key as taskNames}`)}: ${
                  doneTasks[key as GeneralBackgroundTask['name']]
                }`,
            )
            .join('\n'),
        },
        trigger: null,
      });
    }
  }

  getTaskName(task: GeneralBackgroundTask) {
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

  addTask(tasks: GeneralBackgroundTask | GeneralBackgroundTask[]) {
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
        task: task as BackgroundTask<typeof task.name>,
        meta: {
          name: this.getTaskName(task),
          isRunning: false,
          progress: undefined,
          progressText:
            task.name === 'DOWNLOAD_CHAPTER'
              ? task.data.chapterName
              : undefined,
          finalStatus: undefined, // Initialize finalStatus
        },
        id: makeId(),
      }));

      setMMKVObject(this.STORE_KEY, currentTasks.concat(newTasks));
      this.start();
    }
  }

  removeTasksByName(name: GeneralBackgroundTask['name']) {
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
