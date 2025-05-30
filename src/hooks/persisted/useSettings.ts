import {
  AppDefaultSettings,
  AppSettings,
  BrowseDefaultSettings,
  BrowseSettings,
  ChapterGeneralDefaultSettings,
  ChapterGeneralSettings,
  ChapterReaderDefaultSettings,
  ChapterReaderSettings,
  LibraryDefaultSettings,
  LibrarySettings,
  ReaderTheme,
} from '@screens/settings/constants/defaultValues';
import { useMMKVObject } from 'react-native-mmkv';

export const APP_SETTINGS = 'APP_SETTINGS';
export const BROWSE_SETTINGS = 'BROWSE_SETTINGS';
export const LIBRARY_SETTINGS = 'LIBRARY_SETTINGS';
export const CHAPTER_GENERAL_SETTINGS = 'CHAPTER_GENERAL_SETTINGS';
export const CHAPTER_READER_SETTINGS = 'CHAPTER_READER_SETTINGS';

export const useAppSettings = () => {
  const [appSettings = AppDefaultSettings, setSettings] =
    useMMKVObject<AppSettings>(APP_SETTINGS);

  const setAppSettings = (values: Partial<AppSettings>) =>
    setSettings({ ...appSettings, ...values });

  return {
    ...appSettings,
    setAppSettings,
  };
};

export const useBrowseSettings = () => {
  const [browseSettings = BrowseDefaultSettings, setSettings] =
    useMMKVObject<BrowseSettings>(BROWSE_SETTINGS);

  const setBrowseSettings = (values: Partial<BrowseSettings>) =>
    setSettings({ ...browseSettings, ...values });
  return {
    ...browseSettings,
    setBrowseSettings,
  };
};

export const useLibrarySettings = () => {
  const [l, setSettings] = useMMKVObject<LibrarySettings>(LIBRARY_SETTINGS);

  const librarySettings = { ...LibraryDefaultSettings, ...l };

  const setLibrarySettings = (value: Partial<LibrarySettings>) =>
    setSettings({ ...librarySettings, ...value });

  return {
    ...librarySettings,
    setLibrarySettings,
  };
};

export const useChapterGeneralSettings = () => {
  const [chapterGeneralSettings = ChapterGeneralDefaultSettings, setSettings] =
    useMMKVObject<ChapterGeneralSettings>(CHAPTER_GENERAL_SETTINGS);

  const setChapterGeneralSettings = (values: Partial<ChapterGeneralSettings>) =>
    setSettings({ ...chapterGeneralSettings, ...values });

  return {
    ...chapterGeneralSettings,
    setChapterGeneralSettings,
  };
};

export const useChapterReaderSettings = () => {
  const [chapterReaderSettings = ChapterReaderDefaultSettings, setSettings] =
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
