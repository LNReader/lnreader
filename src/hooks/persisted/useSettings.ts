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
  /*
   * General settings
   */
  disableHapticFeedback: boolean;

  /*
   * Appearance settings
   */

  showHistoryTab: boolean;
  showUpdatesTab: boolean;
  showLabelsInNav: boolean;
  useFabForContinueReading: boolean;
  disableLoadingAnimations: boolean;

  /*
   * Library settings
   */

  useLibraryFAB: boolean;

  /*
   * Update settings
   */

  onlyUpdateOngoingNovels: boolean;
  updateLibraryOnLaunch: boolean;
  downloadNewChapters: boolean;
  refreshNovelMetadata: boolean;

  /*
   * Novel settings
   */

  hideBackdrop: boolean;
  defaultChapterSort: string;

  showChapterTitles: 'never' | 'always' | 'read';
}

export const ShowChapterTitlesDisplayMapping = () => ({
  "never": "Never", "always": "Always", "read": "For read chapters" 
});

export interface BrowseSettings {
  showMyAnimeList: boolean;
  showAniList: boolean;
  globalSearchConcurrency?: number;
}

export interface LibrarySettings {
  /**
   * The sort order of novels in the library.
   * 
   * @default Date added (descending, i.e. newest first)
   */
  sortOrder?: LibrarySortOrder;
  /**
   * The current filter for novels in the library.
   * Note that only one of these filters can be active at a time.
   * 
   * @default undefined (none)
   */
  filter?: LibraryFilter;
  /**
   * Whether to show the number of downloaded chapters in a novel on the cover in the library grid
   * (or on the side in list view). If {@linkcode showUnreadBadges} is also `true` the badges are
   * merged seamlessly.
   * 
   * @default true
   */
  showDownloadBadges?: boolean;
  /**
   * Whether to show the number of unread chapters in a novel on the cover in the library grid
   * (or on the side in list view). If {@linkcode showDownloadBadges} is also `true` the badges are
   * merged seamlessly.
   * 
   * @default true
   */
  showUnreadBadges?: boolean;
  /**
   * Whether to show the number of novels per category as a badge on the tab in the library.
   * 
   * @default false
   */
  showNumberOfNovels?: boolean;
  /**
   * The way the list of novels in the library and sources is displayed.
   * 
   * @default Comfortable grid
   */
  displayMode?: DisplayModes;
  /**
   * The number of novels to display in a row in the library and sources,
   * if {@linkcode displayMode} is set to a grid mode.
   * 
   * @default 3 (M)
   */
  novelsPerRow?: number;
  /**
   * If enabled, reading activity will not be added to the history.
   */
  incognitoMode?: boolean;
  /**
   * If enabled, only novels that have downloaded chapters will be shown in the library.
   * Equivalent to the "Downloaded" filter.
   */
  downloadedOnlyMode?: boolean;
}

export interface ChapterGeneralSettings {
  keepScreenOn: boolean;
  fullScreenMode: boolean;
  pageReader: boolean;
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
  tapToScroll: boolean;
  TTSEnable: boolean;
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
  epubLocation: string;
  epubUseAppTheme: boolean;
  epubUseCustomCSS: boolean;
  epubUseCustomJS: boolean;
}

const initialAppSettings: AppSettings = {
  /**
   * Refers to vibrations in response to certain user actions, like long-press selecting chapters.
   */
  disableHapticFeedback: false,


  /*
   * Appearence settings
   */
  showHistoryTab: true,
  showUpdatesTab: true,
  showLabelsInNav: true,
  useFabForContinueReading: false,
  disableLoadingAnimations: false,

  /*
   * Library settings
   */

  useLibraryFAB: false,

  /*
   * Update settings
   */

  onlyUpdateOngoingNovels: false,
  updateLibraryOnLaunch: false,
  downloadNewChapters: false,
  refreshNovelMetadata: false,

  /*
   * Novel settings
   */

  hideBackdrop: false,
  defaultChapterSort: 'ORDER BY position ASC',

  showChapterTitles: 'never',
};

const initialBrowseSettings: BrowseSettings = {
  showMyAnimeList: true,
  showAniList: true,
  globalSearchConcurrency: 3,
};

export const initialChapterGeneralSettings: ChapterGeneralSettings = {
  keepScreenOn: true,
  fullScreenMode: true,
  pageReader: false,
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
  tapToScroll: false,
  TTSEnable: false,
};

export const initialChapterReaderSettings: ChapterReaderSettings = {
  theme: '#292832',
  textColor: '#CCCCCC',
  textSize: 16,
  textAlign: 'left',
  padding: 16,
  fontFamily: '',
  lineHeight: 1.5,
  customCSS: '',
  customJS: '',
  customThemes: [],
  tts: {
    rate: 1,
    pitch: 1,
  },
  epubLocation: '',
  epubUseAppTheme: false,
  epubUseCustomCSS: false,
  epubUseCustomJS: false,
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

const defaultLibrarySettings: LibrarySettings = {
  showNumberOfNovels: false,
  downloadedOnlyMode: false,
  incognitoMode: false,
  displayMode: DisplayModes.Comfortable,
  showDownloadBadges: true,
  showUnreadBadges: true,
  novelsPerRow: 3,
  sortOrder: LibrarySortOrder.DateAdded_DESC,
};

export const useLibrarySettings = () => {
  const [librarySettings, setSettings] =
    useMMKVObject<LibrarySettings>(LIBRARY_SETTINGS);

  const setLibrarySettings = (value: Partial<LibrarySettings>) =>
    setSettings({ ...librarySettings, ...value });

  return {
    ...{ ...defaultLibrarySettings, ...librarySettings },
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
