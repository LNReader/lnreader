import { TurboModule, TurboModuleRegistry } from 'react-native';

interface ChapterItem {
  name: string;
  path: string;
  chapterNumber: number | null;
  releaseTime: string | null;
  page: string | null;
}

enum NovelStatus {
  Unknown = 'Unknown',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Licensed = 'Licensed',
  PublishingFinished = 'Publishing Finished',
  Cancelled = 'Cancelled',
  OnHiatus = 'On Hiatus',
}

// current codegen can not resolve imported types
interface SourceNovel {
  name: string;
  path: string;
  cover: string | null;
  genres: string | null;
  summary: string | null;
  author: string | null;
  artist: string | null;
  status: NovelStatus | null;
  chapters: ChapterItem[];
  totalPages: number | null;
}

export interface Spec extends TurboModule {
  parseNovelAndChapters: (epubDirPath: string) => SourceNovel | null;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeEpubUtil');
