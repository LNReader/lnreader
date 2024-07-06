import { NativeModules } from 'react-native';

interface ReadDirResult {
  name: string;
  path: string;
  isDirectory: boolean; // int
}

interface FileManagerInterface {
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => string;
  resolveExternalContentUri: (uriString: string) => Promise<string | null>;
  copyFile: (sourcePath: string, destPath: string) => Promise<void>;
  moveFile: (sourcePath: string, destPath: string) => Promise<void>;
  exists: (filePath: string) => Promise<boolean>;
  /**
   * @description create parents, and do nothing if exists;
   */
  mkdir: (filePath: string) => Promise<void>;
  /**
   * @description remove recursively
   */
  unlink: (filePath: string) => Promise<void>;
  readDir: (dirPath: string) => Promise<ReadDirResult[]>;
  pickFolder: () => Promise<string | null>;
  downloadFile: (
    url: string,
    destPath: string,
    method: string,
    headers: Record<string, string> | Headers,
    body?: string,
  ) => Promise<void>;
  ExternalDirectoryPath: string;
  ExternalCachesDirectoryPath: string;
}

const { FileManager } = NativeModules;

export default FileManager as FileManagerInterface;
