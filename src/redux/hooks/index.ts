import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { ThemeTypeV1 } from '../../theme/v1/theme/types';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTheme = () =>
  useAppSelector(
    (state: RootState) => state.settingsReducerV2.appearance.theme,
  );

export const useThemeV1 = () =>
  useAppSelector(
    (state: RootState) => state.settingsReducer.theme,
  ) as ThemeTypeV1;

export const useAppearanceSettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.appearance);

export const useReaderSettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.reader);

export const useSettingsV1 = () =>
  useAppSelector((state: RootState) => state.settingsReducer);

export const useReaderSettingsV1 = () =>
  useAppSelector((state: RootState) => state.settingsReducer.reader);

export const useLibrarySettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.library);

export const useUpdateSettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.updates);

export const useSavedChapterData = (chapterId: number) =>
  useAppSelector(
    (state: RootState) =>
      state.localStorageReducer.chapterData[chapterId] || {},
  );

export const useDownloadQueue = () =>
  useAppSelector((state: RootState) => state.downloadsReducer.downloadQueue);
