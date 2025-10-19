import { TurboModule, TurboModuleRegistry } from 'react-native';

interface ReadDirResult {
  name: string;
  path: string;
  isDirectory: boolean; // int
}

export interface Spec extends TurboModule {
  writeFile: (path: string, content: string) => void;
  writeFileFromBase64: (path: string, base64Content: string) => void;
  readFile: (path: string) => string;
  readFileAsBase64: (path: string) => string;
  copyFile: (sourcePath: string, destPath: string) => void;
  moveFile: (sourcePath: string, destPath: string) => void;
  exists: (filePath: string) => boolean;
  /**
   * @description create parents, and do nothing if exists;
   */
  mkdir: (filePath: string) => void;
  /**
   * @description remove recursively
   */
  unlink: (filePath: string) => void;
  readDir: (dirPath: string) => ReadDirResult[];
  downloadFile: (
    url: string,
    destPath: string,
    method: string,
    headers: { [key: string]: string } | Headers,
    body?: string,
  ) => Promise<void>;
  getConstants: () => {
    ExternalDirectoryPath: string;
    ExternalCachesDirectoryPath: string;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFile');
