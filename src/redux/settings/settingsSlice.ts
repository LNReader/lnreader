import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { BrowseSettingsMap } from './types';

interface SettingsState {
  appearance: {};
  reader: {};
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
  reader: {},
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
  },
});

export const { setBrowseSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
