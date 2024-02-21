import { NativeModules } from 'react-native';
interface ZipArchiveInterface {
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
}
const { TextFile } = NativeModules;

export default TextFile as ZipArchiveInterface;
