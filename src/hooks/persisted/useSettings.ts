import {
  DisplayModes,
  LibraryFilter,
  LibrarySortOrder,
} from '@screens/library/constants/constants';
import { useMMKVObject } from 'react-native-mmkv';

export const LIBRARY_SETTINGS = 'LIBRARY_SETTINGS';
export const CHAPTER_GENERAL_SETTINGS = 'CHAPTER_GENERAL_SETTINGS';
export const CHAPTER_READER_SETTINGS = 'CHAPTER_READER_SETTINGS';

export interface LibrarySettings {
  sortOrder?: LibrarySortOrder;
  filter?: LibraryFilter;
  showDownloadBadges?: boolean;
  showUnreadBadges?: boolean;
  showNumberOfNovels?: boolean;
  displayMode?: DisplayModes;
  novelsPerRow?: number;
  incognitoMode?: boolean;
  downloadedOnlyMode?: boolean;
  useLibraryFAB?: boolean;
}

export interface ChapterGeneralSettings {
  fullScreenMode: boolean;
  swipeGestures: boolean;
  showScrollPercentage: boolean;
  useVolumeButtons: boolean;
  showBatteryAndTime: boolean;
  autoScroll: boolean;
  autoScrollInterval: number;
  autoScrollOffset: number | null;
  verticalSeekbar: boolean;
  removeExtraParagraphSpacing: boolean;
}

export interface ChapterReaderSettings {
  theme: string;
  textColor: string;
  textSize: number;
  textAlign: string;
  padding: number;
  fontFamily: string;
  lineHeight: number;
  customCSS: string;
  customJS: string;
}

const initialChapterGeneralSettings: ChapterGeneralSettings = {
  fullScreenMode: true,
  swipeGestures: false,
  showScrollPercentage: true,
  useVolumeButtons: false,
  showBatteryAndTime: false,
  autoScroll: false,
  autoScrollInterval: 10,
  autoScrollOffset: null,
  verticalSeekbar: true,
  removeExtraParagraphSpacing: false,
};

const initialChapterReaderSettings: ChapterReaderSettings = {
  theme: '#292832',
  textColor: '#CCCCCC',
  textSize: 16,
  textAlign: 'left',
  padding: 2,
  fontFamily: '',
  lineHeight: 1.5,
  customCSS: '',
  customJS: '',
};

export const useLibrarySettings = () => {
  const [librarySettings, setSettings] =
    useMMKVObject<LibrarySettings>(LIBRARY_SETTINGS);

  const setLibrarySettings = (value: Partial<LibrarySettings>) =>
    setSettings({ ...librarySettings, ...value });

  return {
    ...librarySettings,
    setLibrarySettings,
  };
};

export const useChapterGeneralSettings = () => {
  const [chapterGeneralSettings = initialChapterGeneralSettings, setSettings] =
    useMMKVObject<ChapterGeneralSettings>(CHAPTER_GENERAL_SETTINGS);

  const setChapterGeneralSettings = (values: Partial<ChapterGeneralSettings>) =>
    setSettings({ ...chapterGeneralSettings, ...values });

  return {
    ...chapterGeneralSettings,
    setChapterGeneralSettings,
  };
};

export const useChapterReaderSettings = () => {
  const [chapterReaderSettings = initialChapterReaderSettings, setSettings] =
    useMMKVObject<ChapterReaderSettings>(CHAPTER_READER_SETTINGS);

  const setChapterReaderSettings = (values: Partial<ChapterReaderSettings>) =>
    setSettings({ ...chapterReaderSettings, ...values });

  return {
    ...chapterReaderSettings,
    setChapterReaderSettings,
  };
};
