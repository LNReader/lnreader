import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  unzip: (sourceFilePath: string, distDirPath: string) => Promise<void>;
  remoteUnzip: (
    distDirPath: string,
    url: string,
    headers: { [key: string]: string },
  ) => Promise<void>;
  remoteZip: (
    sourceDirPath: string,
    url: string,
    headers: { [key: string]: string },
  ) => Promise<string>; // return response as text
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeZipArchive');
