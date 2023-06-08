export enum DataFilePath {
  Category = 'Category.json',
  Novel = 'Novel.json',
  NovelCatgory = 'NovelCategory.json',
  Setting = 'Setting.json',
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
  Category = 'Category',
  Novel = 'Novel',
  NovelCover = 'NovelCover',
  NovelCategory = 'NovelCategory',
  Chapter = 'Chapter',
  Download = 'Download',
  Image = 'Image',
  Plugin = 'Plugin',
  Setting = 'Setting',
  Error = 'Error',
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
}

export interface BackupTask {
  taskType: TaskType; // for notification

  // Images or ChapterText could be large, so transfer it one by one
  subtasks: Array<() => Promise<RequestPackage>>;
}
