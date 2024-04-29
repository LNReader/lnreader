import {
  DisplayModes,
  LibraryFilter,
  LibrarySortOrder,
} from '@screens/library/constants/constants';
import { useMMKVObject } from 'react-native-mmkv';
import { Voice } from 'expo-speech';

export const APP_SETTINGS = 'APP_SETTINGS';
export const BROWSE_SETTINGS = 'BROWSE_SETTINGS';
export const LIBRARY_SETTINGS = 'LIBRARY_SETTINGS';
export const CHAPTER_GENERAL_SETTINGS = 'CHAPTER_GENERAL_SETTINGS';
export const CHAPTER_READER_SETTINGS = 'CHAPTER_READER_SETTINGS';

export interface AppSettings {
  /**
   * General settings
   */

  incognitoMode: boolean;
  disableHapticFeedback: boolean;

  /**
   * Appearence settings
   */

  showHistoryTab: boolean;
  showUpdatesTab: boolean;
  showLabelsInNav: boolean;
  useFabForContinueReading: boolean;

  /**
   * Library settings
   */

  downloadedOnlyMode: boolean;
  useLibraryFAB: boolean;

  /**
   * Update settings
   */

  onlyUpdateOngoingNovels: boolean;
  updateLibraryOnLaunch: boolean;
  downloadNewChapters: boolean;
  refreshNovelMetadata: boolean;

  /**
   * Novel settings
   */

  hideBackdrop: boolean;
  defaultChapterSort: string;
}

export interface BrowseSettings {
  showMyAnimeList: boolean;
  showAniList: boolean;
}

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
  bionicReading: boolean;
}

export interface ReaderTheme {
  backgroundColor: string;
  textColor: string;
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
  customThemes: ReaderTheme[];
  tts?: {
    voice?: Voice;
    rate?: number;
    pitch?: number;
  };
}

const initialAppSettings: AppSettings = {
  /**
   * General settings
   */

  incognitoMode: false,
  disableHapticFeedback: false,

  /**
   * Appearence settings
   */

  showHistoryTab: true,
  showUpdatesTab: true,
  showLabelsInNav: true,
  useFabForContinueReading: false,

  /**
   * Library settings
   */

  downloadedOnlyMode: false,
  useLibraryFAB: false,

  /**
   * Update settings
   */

  onlyUpdateOngoingNovels: false,
  updateLibraryOnLaunch: false,
  downloadNewChapters: false,
  refreshNovelMetadata: false,

  /**
   * Novel settings
   */

  hideBackdrop: false,
  defaultChapterSort: 'ORDER BY position ASC',
};

const initialBrowseSettings: BrowseSettings = {
  showMyAnimeList: true,
  showAniList: true,
};

export const initialChapterGeneralSettings: ChapterGeneralSettings = {
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
  bionicReading: false,
};

export const initialChapterReaderSettings: ChapterReaderSettings = {
  theme: '#292832',
  textColor: '#CCCCCC',
  textSize: 16,
  textAlign: 'left',
  padding: 2,
  fontFamily: '',
  lineHeight: 1.5,
  customCSS: '',
  customJS: '',
  customThemes: [],
  tts: {
    rate: 1,
    pitch: 1,
  },
};

export const useAppSettings = () => {
  const [appSettings = initialAppSettings, setSettings] =
    useMMKVObject<AppSettings>(APP_SETTINGS);

  const setAppSettings = (values: Partial<AppSettings>) =>
    setSettings({ ...appSettings, ...values });

  return {
    ...appSettings,
    setAppSettings,
  };
};

export const useBrowseSettings = () => {
  const [browseSettings = initialBrowseSettings, setSettings] =
    useMMKVObject<BrowseSettings>(BROWSE_SETTINGS);

  const setBrowseSettings = (values: Partial<BrowseSettings>) =>
    setSettings({ ...browseSettings, ...values });

  return {
    ...browseSettings,
    setBrowseSettings,
  };
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

  const saveCustomReaderTheme = (theme: ReaderTheme) =>
    setSettings({
      ...chapterReaderSettings,
      customThemes: [theme, ...chapterReaderSettings.customThemes],
    });

  const deleteCustomReaderTheme = (theme: ReaderTheme) =>
    setSettings({
      ...chapterReaderSettings,
      customThemes: chapterReaderSettings.customThemes.filter(
        v =>
          !(
            v.backgroundColor === theme.backgroundColor &&
            v.textColor === theme.textColor
          ),
      ),
    });

  return {
    ...chapterReaderSettings,
    setChapterReaderSettings,
    saveCustomReaderTheme,
    deleteCustomReaderTheme,
  };
};
