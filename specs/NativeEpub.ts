import { TurboModule, TurboModuleRegistry } from 'react-native';

interface EpubChapter {
  name: string;
  path: string;
}
interface EpubNovel {
  name: string;
  cover: string | null;
  summary: string | null;
  author: string | null;
  artist: string | null;
  chapters: EpubChapter[];
  cssPaths: string[];
  imagePaths: string[];
}

export interface Spec extends TurboModule {
  parseNovelAndChapters: (epubDirPath: string) => EpubNovel;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeEpub');
