import {
  ChapterGeneralSettings,
  ChapterReaderSettings,
} from '@hooks/persisted/useSettings';
import 'typescript';
import 'typescript/lib/lib.dom';

interface Reader {
  selection: Selection;
  viewport: HTMLMetaElement;
  footerWrapper: HTMLDivElement;
  percentage: HTMLDivElement;
  battery: HTMLDivElement;
  time: HTMLDivElement;
  paddingTop: number;
  chapter: HTMLElement;
  chapterHeight: number;
  layoutHeight: number;
  pluginId: string;
  novelId: string;
  chapterId: string;
  saveProgressInterval: NodeJS.Timeout;
  timeInterval: NodeJS.Timeout;
  refresh: () => void;
  post: (message: { type: string; data?: any }) => void;
  updateReaderSettings: (settings: ChapterReaderSettings) => void;
  updateGeneralSettings: (settings: ChapterGeneralSettings) => void;
  updateBatteryLevel: (level: number) => void;
}

interface TextToSpeech {
  reader: Reader;
  leaf: HTMLElement;
  TTSWrapper: HTMLElement;
  TTSEle: HTMLElement;
  reading: boolean;
  start: () => void;
  startHere: () => void;
  resume: () => void;
  pause: () => void;
  stop: () => void;
  started: () => boolean;
}

export enum ContextMenuItem {
  START_READING = 'START_READING',
  START_HERE = 'START_HERE',
  COPY = 'COPY',
  SELECT_ALL = 'SELECT_ALL',
}
interface ContextMenu {
  reader: Reader;
  contextMenu: HTMLUListElement;
  items: Record<ContextMenuItem, HTMLLIElement>;
  renderItem: (data: {
    name: string;
    icon: string;
    action: () => void;
  }) => HTMLLIElement;
  renderMenu: (items: HTMLLIElement[]) => void;
  closeMenu: (menu: HTMLUListElement) => void;
  init: () => void;
}

interface ImageModal {
  reader: Reader;
  showing: boolean;
  show: (image: HTMLImageElement) => void;
  hide: () => void;
}
