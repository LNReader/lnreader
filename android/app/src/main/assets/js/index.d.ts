import { ChapterInfo, NovelInfo } from '@database/types';
import {
  ChapterGeneralSettings,
  ChapterReaderSettings,
} from '@hooks/persisted/useSettings';

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

  updateCallbacks: UpdateCallbackMap;
  novel: NovelInfo;
  chapter: ChapterInfo;
  chapterGeneralSettings: ChapterGeneralSettings;
  chapterReaderSettings: ChapterReaderSettings;
  autoSaveInterval: number;
  initalBatteryLevel: number;

  //layout props
  paddingTop: number;
  layoutHeight: number;
  chapterHeight: number;
  layoutWidth: number;

  // methods used by webview
  post: (obj: Record<string, any>) => void;
  subscribe<T extends keyof UpdateCallbackMap>(
    name: T,
    callback: UpdateCallbackMap[T][number],
  ): void;
  refresh: () => void;

  // methods used by app
  updateHidden: (hidden: boolean) => void;
  updateGeneralSettings: (settings: ChapterGeneralSettings) => void;
  updateReaderSettings: (settings: ChapterReaderSettings) => void;
  updateBatteryLevel: (level: number) => void;
}

declare global {
  const reader: Reader;
}
