/**
 * @deprecated
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { BrowseSettingsMap } from './types';

export interface ReaderTheme {
  backgroundColor: string;
  textColor: string;
}

interface SettingsState {
  appearance: {};
  reader: {
    customThemes: ReaderTheme[];
  };
  library: {};
  updates: {};
  app: {};
  browse: {
    onlyShowPinnedSources: boolean;
    showMyAnimeList: boolean;
    searchAllSources: boolean;
  };
}

const initialState: SettingsState = {
  appearance: {},
  reader: {
    customThemes: [],
  },
  library: {},
  updates: {},
  app: {},
  browse: {
    onlyShowPinnedSources: false,
    showMyAnimeList: true,
    searchAllSources: false,
  },
};

export const settingsSlice = createSlice({
  name: 'settingsReducerV2',
  initialState,
  reducers: {
    setBrowseSettings: (
      state,
      action: PayloadAction<{ key: keyof BrowseSettingsMap; value: any }>,
    ) => {
      if (state?.browse === undefined) {
        state.browse = initialState.browse;
      }

      state.browse[action.payload.key] = action.payload.value;
    },
    saveCustomReaderTheme: (
      state,
      action: PayloadAction<{ theme: ReaderTheme }>,
    ) => {
      state.reader.customThemes = [
        ...(state.reader.customThemes || []),
        action.payload.theme,
      ];
    },
    deleteCustomReaderTheme: (
      state,
      action: PayloadAction<{ theme: ReaderTheme }>,
    ) => {
      const customTheme = action.payload.theme;
      state.reader.customThemes = state.reader.customThemes.filter(
        theme =>
          !(
            theme.backgroundColor === customTheme.backgroundColor &&
            theme.textColor === customTheme.textColor
          ),
      );
    },
  },
});

export const {
  setBrowseSettings,
  saveCustomReaderTheme,
  deleteCustomReaderTheme,
} = settingsSlice.actions;

export default settingsSlice.reducer;
