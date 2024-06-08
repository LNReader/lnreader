import { NativeModules } from 'react-native';

interface ReadDirResult {
  name: string;
  path: string;
  isDirectory: boolean; // int
}

interface FileManagerInterface {
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  resolveExternalContentUri: (uriString: string) => Promise<string | null>;
  copyFile: (sourcePath: string, destPath: string) => Promise<void>;
  moveFile: (sourcePath: string, destPath: string) => Promise<void>;
  exists: (filePath: string) => Promise<boolean>;
  mkdir: (filePath: string) => Promise<void>; // create parents;
  unlink: (filePath: string) => Promise<void>; // remove recursively
  readDir: (dirPath: string) => Promise<ReadDirResult[]>; // file/sub-folder names
  pickFolder: () => Promise<string | null>; // return path of folderc
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
