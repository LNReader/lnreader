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
  chapterElement: HTMLElement;
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
  rawHTML: string;

  //layout props
  paddingTop: number;
  layoutHeight: number;
  chapterHeight: number;
  layoutWidth: number;

  post: (obj: Record<string, any>) => void;
  refresh: () => void;
}

interface TTS {
  started: boolean;
  reading: boolean;
  start: (element?: HTMLElement) => void;
  resume: () => void;
  stop: () => void;
  pause: () => void;
  readable: (element?: HTMLElement) => void;
}

declare global {
  const reader: Reader;
  const tts: TTS;
}
