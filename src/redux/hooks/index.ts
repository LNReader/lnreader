import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTheme = () =>
  useAppSelector(
    (state: RootState) => state.settingsReducerV2.appearance.theme,
  );

export const useAppearanceSettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.appearance);

export const useReaderSettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.reader);

export const useLibrarySettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.library);

export const useUpdateSettings = () =>
  useAppSelector((state: RootState) => state.settingsReducerV2.updates);

export const useSourcesReducer = () =>
  useAppSelector((state: RootState) => state.sourcesReducerV2);
