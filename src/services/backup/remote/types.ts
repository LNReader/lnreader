export enum DataFilePath {
  Version = 'Version.json',
  Category = 'Category.json',
  Novel = 'Novel.json',
  NovelCatgory = 'NovelCategory.json',
  Setting = 'Setting.json',
  Theme = 'Theme.json',
}

export enum DataFolderPath {
  Chapter = 'Chapters',
  Download = 'Downloads',
}

export enum RequestType {
  Backup = 'Backup',
  Restore = 'Restore',
  OldRestore = 'OldRestore',
}

export enum TaskType {
  Version = 'Version',
  Category = 'Category',
  Novel = 'Novel',
  NovelCover = 'NovelCover',
  NovelCategory = 'NovelCategory',
  Chapter = 'Chapter',
  Download = 'Download',
  Image = 'Image',
  Plugin = 'Plugin',
  Setting = 'Setting',
  Theme = 'Theme',
}

export interface SocketPackage {
  content?: any;
  encoding?: string; // 'base64', 'utf-8', undifined -> content is json
  relative_path?: string | DataFilePath;
}

export interface RequestPackage extends SocketPackage {
  taskType: TaskType;
}

export interface ResponsePackage extends SocketPackage {
  success: boolean;
  message: any;
  total?: number; // total tasks
  taskType?: TaskType;
}

export interface BackupTask {
  taskType: TaskType; // for notification

  // Images or ChapterText could be large, so transfer it one by one
  subtasks: Array<() => Promise<RequestPackage>>;
}
