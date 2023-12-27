import { PayloadAction, createSlice } from '@reduxjs/toolkit';
/**
 * Display Mode
 *
 * 0 -> Compact
 * 1 -> Comfortable
 * 2 -> List
 * 3 -> No title
 */
interface ReaderSettingsState {
  theme: string;
  textColor: string;
  textSize: number;
  textAlign: string;
  padding: number;
  fontFamily: string;
  lineHeight: number;
  customCSS: string;
  customJS: string;
}
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

  /**
   * Reader settings
   */

  fullScreenMode: boolean;
  swipeGestures: boolean;
  showScrollPercentage: boolean;
  useVolumeButtons: boolean;
  showBatteryAndTime: boolean;
  autoScroll: boolean;
  autoScrollInterval: number;
  autoScrollOffset: number | null;
  verticalSeekbar: boolean;
  removeExtraParagraphSpacing: boolean;

  reader: ReaderSettingsState;
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

  /**
   * Reader settings
   */

  fullScreenMode: true,
  swipeGestures: false,
  showScrollPercentage: true,
  useVolumeButtons: false,
  showBatteryAndTime: false,
  autoScroll: false,
  autoScrollInterval: 10,
  autoScrollOffset: null,
  verticalSeekbar: true,
  removeExtraParagraphSpacing: false,

  reader: {
    theme: '#292832',
    textColor: '#CCCCCC',
    textSize: 16,
    textAlign: 'left',
    padding: 2,
    fontFamily: '',
    lineHeight: 1.5,
    customCSS: '',
    customJS: '',
  },
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
    setReaderSettings: (
      state,
      action: PayloadAction<{ key: keyof ReaderSettingsState; value: any }>,
    ) => {
      state.reader[action.payload.key] = action.payload.value as never;
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
export const { setAppSettings, setReaderSettings, restoreSettingsState } =
  settingsSlice.actions;

export default settingsSlice.reducer;
