import { ChapterInfo, NovelInfo } from '@database/types';
import {
  ChapterGeneralSettings,
  ChapterReaderSettings,
} from '@hooks/persisted/useSettings';

interface UpdateCallbackMap {
  generalSettings: Array<(settings: ChapterGeneralSettings) => void>;
  batterLevel: Array<(level: number) => void>;
}

export interface Reader {
  // props
  chapterElemet: HTMLElement;
  selection: Selection;
  updateCallbacks: UpdateCallbackMap;
  novel: NovelInfo;
  chapter: ChapterInfo;
  chapterGeneralSettings: ChapterGeneralSettings;
  chapterReaderSettings: ChapterReaderSettings;
  autoSaveInterval: number;
  layoutHeight: number;
  chapterHeight: number;

  // methods used by webview
  post: (obj: Record<string, any>) => void;
  subscribe<T extends keyof UpdateCallbackMap>(
    name: T,
    callback: UpdateCallbackMap[T][number],
  ): void;
  refresh: () => void;

  // methods used by app
  updateGeneralSettings: (settings: ChapterGeneralSettings) => void;
  updateReaderSettings: (settings: ChapterReaderSettings) => void;
  updateBatteryLevel: (level: number) => void;
  click: () => void;
}

declare global {
  const reader: Reader;
}
