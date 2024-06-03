import { NativeModules } from 'react-native';

interface ReadDirResult {
  name: string;
  path: string;
  isDirectory: boolean; // int
}

interface FileManagerInterface {
  writeFile: (
    path: string,
    content: string,
    encoding?: 'utf8' | 'base64',
  ) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  resolveExternalContentUri: (uriString: string) => Promise<string | null>;
  copyFile: (sourcePath: string, destPath: string) => Promise<void>;
  moveFile: (sourcePath: string, destPath: string) => Promise<void>;
  exists: (filePath: string) => Promise<boolean>;
  mkdir: (filePath: string) => Promise<void>; // create parents;
  unlink: (filePath: string) => Promise<void>; // remove recursively
  readDir: (dirPath: string) => Promise<ReadDirResult[]>; // file/sub-folder names
  ExternalDirectoryPath: string;
  ExternalCachesDirectoryPath: string;
}

const { FileManager } = NativeModules;

const _FileManager = {
  ...FileManager,
  writeFile: (path: string, destPath: string, encoding?: 'utf8' | 'base64') => {
    return FileManager.writeFile(path, destPath, encoding || null);
  },
};

export default _FileManager as FileManagerInterface;
