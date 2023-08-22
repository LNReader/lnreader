import { NativeModules } from 'react-native';

interface EpubParserInterface {
  openDirectory(): void;
}

const { EpubParser } = NativeModules;
export default EpubParser as EpubParserInterface;
