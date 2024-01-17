export enum BackupFolderName {
  DATA = 'Data',
  DOWNLOAD = 'Download',
  NOVEL_AND_CHAPTERS = 'NovelAndChapters',
}

export enum BackupDataFileName {
  VERSION = 'Version.json',
  CATEGORY = 'Category.json',
  SETTING = 'Setting.json',
  THEME = 'Theme.json',
}

export enum TaskType {
  VERSION = 'Version',
  CATEGORY = 'Category',
  NOVEL_AND_CHAPTERS = 'Novel and Chapters',
  DOWNLOAD = 'Download',
  SETTING = 'Setting',
  THEME = 'Theme',
}

export interface BackupPackage {
  folderTree: string[]; // for Drive, it must be [parentId]
  content: string; // file text content or file uri
  name: string;
  mimeType: string;
}

export interface RestoreTask {
  taskType: TaskType;
  subtasks: Array<() => Promise<void>>;
}

export interface BackupTask {
  taskType: TaskType; // for notification
  subtasks: Array<() => Promise<BackupPackage>>;
}
