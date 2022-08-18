import { useMMKVObject } from 'react-native-mmkv';
import { CategorySettings, LibrarySettings } from '../utils/constants/settings';

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

export const useCategorySettings = () => {
  const [categorySettings, setSettings] =
    useMMKVObject<CategorySettings>('CategorySettings');

  const setCategorySettings = (value: Partial<CategorySettings>) =>
    setSettings({ ...categorySettings, ...value });

  return {
    ...categorySettings,
    setCategorySettings,
  };
};
