import { SourceNovel } from '@plugins/types';
import { NativeModules } from 'react-native';
interface EpubUtilInterface {
  parseNovelAndChapters: (epubDirPath: string) => Promise<SourceNovel>;
}
const { EpubUtil } = NativeModules;

export default EpubUtil as EpubUtilInterface;
