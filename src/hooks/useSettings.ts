import { useMMKVObject } from 'react-native-mmkv';

import { LibrarySettings } from '../utils/constants/settings';

export const useLibrarySettings = () => {
  const [librarySettings, setSettings] =
    useMMKVObject<LibrarySettings>('LibrarySettings');

  const setLibrarySettings = (value: Partial<LibrarySettings>) =>
    setSettings({ ...librarySettings, ...value });

  return {
    ...librarySettings,
    setLibrarySettings,
  };
};
