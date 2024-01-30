import { NativeModules } from 'react-native';
interface ZipArchiveInterface {
  unzip: (sourceFilePath: string, distDirPath: string) => Promise<void>;
  remoteUnzip: (
    distDirPath: string,
    url: string,
    headers?: Record<string, string>,
  ) => Promise<void>;
  remoteZip: (
    sourceDirPath: string,
    url: string,
    headers?: Record<string, string>,
  ) => Promise<void>;
}
const { ZipArchive } = NativeModules;

export default ZipArchive as ZipArchiveInterface;
