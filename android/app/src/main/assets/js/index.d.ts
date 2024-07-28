import { ChapterInfo, NovelInfo } from '@database/types';
import {
  ChapterGeneralSettings,
  ChapterReaderSettings,
} from '@hooks/persisted/useSettings';
import { State } from './van';

interface UpdateCallbackMap {
  generalSettings: Array<(settings: ChapterGeneralSettings) => void>;
  batteryLevel: Array<(level: number) => void>;
  hidden: Array<(hidden: boolean) => void>;
}

export interface Reader {
  // element
  chapterElemet: HTMLElement;
  viewport: HTMLMetaElement;
  selection: Selection;

  // state
  hidden: State<boolean>;
  generalSettings: State<ChapterGeneralSettings>;
  readerSettings: State<ChapterReaderSettings>;
  batteryLevel: State<number>;

  novel: NovelInfo;
  chapter: ChapterInfo;
  autoSaveInterval: number;

  //layout props
  paddingTop: number;
  layoutHeight: number;
  chapterHeight: number;
  layoutWidth: number;

  post: (obj: Record<string, any>) => void;
  refresh: () => void;
}

declare global {
  const reader: Reader;
}
