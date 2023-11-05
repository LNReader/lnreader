import { SourceNovel } from '@plugins/types';
import { NativeModules } from 'react-native';
interface EpubParserInterface {
  parse: (epubFilePath: string, epubDirPath: string) => Promise<SourceNovel>;
}
const { EpubParser } = NativeModules;

export default EpubParser as EpubParserInterface;
