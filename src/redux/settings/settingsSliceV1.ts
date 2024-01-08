import { PayloadAction, createSlice } from '@reduxjs/toolkit';
/**
 * Display Mode
 *
 * 0 -> Compact
 * 1 -> Comfortable
 * 2 -> List
 * 3 -> No title
 */
interface SettingsState {
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
   * Browse settings
   */

  searchAllSources: boolean;
  onlyShowPinnedSources: boolean;

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

const initialState: SettingsState = {
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
  showLabelsInNav: false,
  useFabForContinueReading: false,

  /**
   * Library settings
   */

  downloadedOnlyMode: false,
  useLibraryFAB: false,

  /**
   * Browse settings
   */

  searchAllSources: false,
  onlyShowPinnedSources: false,

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
  defaultChapterSort: 'ORDER BY id ASC',
};

const settingsSlice = createSlice({
  name: 'settingsReducerV1',
  initialState,
  reducers: {
    setAppSettings: (
      state,
      action: PayloadAction<{ key: keyof SettingsState; value: any }>,
    ) => {
      state[action.payload.key] = action.payload.value as never;
    },
    restoreSettingsState: (state, action: PayloadAction<SettingsState>) => {
      for (let key in state) {
        state[key as keyof SettingsState] = action.payload[
          key as keyof SettingsState
        ] as never;
      }
    },
  },
});
export const { setAppSettings, restoreSettingsState } = settingsSlice.actions;

export default settingsSlice.reducer;
