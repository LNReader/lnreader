import {
  defaultSettings,
  DefaultSettings,
  ReaderTheme,
} from '@screens/settings/constants/defaultValues';
import { useCallback, useEffect, useMemo } from 'react';
import { useMMKVObject } from 'react-native-mmkv';

export const APP_SETTINGS = 'APP_SETTINGS';
export const BROWSE_SETTINGS = 'BROWSE_SETTINGS';
export const LIBRARY_SETTINGS = 'LIBRARY_SETTINGS';
export const CHAPTER_GENERAL_SETTINGS = 'CHAPTER_GENERAL_SETTINGS';
export const CHAPTER_READER_SETTINGS = 'CHAPTER_READER_SETTINGS';

export const SETTINGS = 'SETTINGS';

export const useSettings = () => {
  const [settings, _setSettings] = useMMKVObject<DefaultSettings>(SETTINGS);

  const [appSettings] = useMMKVObject<Partial<DefaultSettings>>(APP_SETTINGS);
  const [browseSettings] =
    useMMKVObject<Partial<DefaultSettings>>(BROWSE_SETTINGS);
  const [librarySettings] =
    useMMKVObject<Partial<DefaultSettings>>(LIBRARY_SETTINGS);
  const [chapterGeneralSettings] = useMMKVObject<Partial<DefaultSettings>>(
    CHAPTER_GENERAL_SETTINGS,
  );
  const [chapterReaderSettings] = useMMKVObject<Partial<DefaultSettings>>(
    CHAPTER_READER_SETTINGS,
  );

  useEffect(() => {
    if (settings === undefined) {
      _setSettings({
        ...defaultSettings,
        ...appSettings,
        ...browseSettings,
        ...librarySettings,
        ...chapterGeneralSettings,
        ...chapterReaderSettings,
      });
    }
  }, [
    settings,
    _setSettings,
    appSettings,
    browseSettings,
    librarySettings,
    chapterGeneralSettings,
    chapterReaderSettings,
  ]);

  const setSettings = useCallback(
    (values: Partial<DefaultSettings>) =>
      _setSettings(prev => ({ ...prev, ...values } as DefaultSettings)),
    [_setSettings],
  );

  const saveCustomReaderTheme = useCallback(
    (theme: ReaderTheme) => {
      const themes = settings?.customThemes || [];
      setSettings({
        customThemes: [theme, ...themes],
      });
    },
    [setSettings, settings?.customThemes],
  );

  const deleteCustomReaderTheme = useCallback(
    (theme: ReaderTheme) => {
      const themes = settings?.customThemes || [];
      setSettings({
        customThemes: themes.filter(
          v =>
            !(
              v.backgroundColor === theme.backgroundColor &&
              v.textColor === theme.textColor
            ),
        ),
      });
    },
    [setSettings, settings?.customThemes],
  );

  // Memoize the final settings object to provide a stable default
  const value = useMemo(
    () => ({
      ...{ ...defaultSettings, ...settings }, // Use loaded settings or fall back to default
      setSettings,
      saveCustomReaderTheme,
      deleteCustomReaderTheme,
    }),
    [settings, setSettings, saveCustomReaderTheme, deleteCustomReaderTheme],
  );

  return value;
};
