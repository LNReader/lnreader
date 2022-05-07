import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// import { defaultDarkTheme } from '../../theme/dark';
import { BrowseSettingsMap } from './types';

export enum DisplayModes {
  Compact = 'compact',
  Comfortable = 'comfortable',
  NoTitle = 'no title',
  List = 'list',
}

export enum TextAlignments {
  Left = 'left',
  Center = 'center',
  Justify = 'justfy',
  Right = 'right',
}

// interface ReaderTheme {
//   backgroundColor: string;
//   textColor: string;
// }

interface SettingsState {
  appearance: {
    // theme: ThemeType;
    displayMode: DisplayModes;
    novelsPerRowPotrait: number;
    novelsPerRowLandscape: number;
    showLabelsInNav: boolean;
    showHistoryTab: boolean;
    showUpdatesTab: boolean;
  };
  reader: {
    fontFamily: string | null;
    fontSize: number;
    lineHeight: number;
    textAlign: TextAlignments;
    backgroundColor: string;
    textColor: string;
    paddingHorizontal: number;
    customCSS: string | null;
    fullScreenMode: boolean;
    useWebViewReader: boolean;
    showProgressPercentage: boolean;
    useSwipeGestures: boolean;
  };
  library: {
    filters: string[];
    sort: string;
    showDownloadsBadge: boolean;
    showUnreadBadge: boolean;
    updateLibraryOnLaunch: boolean;
  };
  updates: {
    lastUpdateTime: Date | null;
    onlyUpdateOngoingNovels: boolean;
    updateNovelMetadata: boolean;
    showLastUpdateTime: boolean;
  };
  app: {
    incognitoMode: boolean;
    downloadOnlyMode: boolean;
  };
  browse: {
    onlyShowPinnedSources: boolean;
    showMyAnimeList: boolean;
    searchAllSources: boolean;
  };
}

const initialState: SettingsState = {
  appearance: {
    // theme: defaultDarkTheme,
    displayMode: DisplayModes.Compact,
    novelsPerRowPotrait: 3,
    novelsPerRowLandscape: 6,
    showLabelsInNav: true,
    showHistoryTab: true,
    showUpdatesTab: true,
  },
  reader: {
    fontFamily: '',
    fontSize: 16,
    lineHeight: 1.5,
    textAlign: TextAlignments.Left,
    backgroundColor: '#000000',
    textColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 5,
    customCSS: null,
    fullScreenMode: true,
    useWebViewReader: false,
    showProgressPercentage: false,
    useSwipeGestures: false,
  },
  library: {
    filters: [],
    sort: 'novelId DESC',
    showDownloadsBadge: true,
    showUnreadBadge: true,
    updateLibraryOnLaunch: false,
  },
  updates: {
    lastUpdateTime: null,
    onlyUpdateOngoingNovels: false,
    updateNovelMetadata: false,
    showLastUpdateTime: false,
  },
  app: {
    incognitoMode: false,
    downloadOnlyMode: false,
  },
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
