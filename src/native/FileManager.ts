import { NativeModules } from 'react-native';
interface FileManagerInterface {
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  resolveExternalContentUri: (uriString: string) => Promise<string | null>;
}
const { FileManager } = NativeModules;

export default FileManager as FileManagerInterface;
