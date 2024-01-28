import { SourceNovel } from '@plugins/types';
import { NativeModules } from 'react-native';
interface ZipArchiveInterface {
  unzip: (epubFilePath: string, epubDirPath: string) => Promise<SourceNovel>;
}
const { ZipArchive } = NativeModules;

export default ZipArchive as ZipArchiveInterface;
