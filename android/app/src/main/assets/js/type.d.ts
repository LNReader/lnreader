import {
  ChapterGeneralSettings,
  ChapterReaderSettings,
} from '@hooks/persisted/useSettings';
import 'typescript';
import 'typescript/lib/lib.dom';

interface Reader {
  selection: Selection;
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

export enum ContextMenuItem {
  START_READING = 'START_READING',
  CONTINUE_READING = 'CONTINUE_READING',
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
