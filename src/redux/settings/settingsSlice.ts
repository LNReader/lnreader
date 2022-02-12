import {StatusBar} from 'react-native';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {ColorScheme, ThemeType} from '../../theme/types';
import {defaultDarkTheme} from '../../theme/dark';

export enum DisplayModes {
  Compact = 'compact',
  Comfortable = 'comfortable',
  NoTitle = 'noTitle',
  List = 'list',
}

enum TextAlignments {
  Left = 'left',
  Center = 'center',
  Justify = 'justfy',
  Right = 'right',
}

interface ReaderTheme {
  backgroundColor: string;
  textColor: string;
}

interface SettingsState {
  appearance: {
    theme: ThemeType;
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
  };
  library: {
    filters: string[];
    sort: string;
    showDownloadsBadge: boolean;
    showUnreadBadge: boolean;
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
}

const initialState: SettingsState = {
  appearance: {
    theme: defaultDarkTheme,
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
  },
  library: {
    filters: [],
    sort: 'novelId DESC',
    showDownloadsBadge: true,
    showUnreadBadge: true,
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
};

export const settingsSlice = createSlice({
  name: 'settingsReducerV2',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      StatusBar.setBarStyle(
        action.payload.type === ColorScheme.DARK
          ? 'light-content'
          : 'dark-content',
      );
      state.appearance.theme = action.payload;
    },
    setDisplayMode: (state, action: PayloadAction<DisplayModes>) => {
      state.appearance.displayMode = action.payload;
    },
    toggleShowUpdatesTab: state => {
      state.appearance.showUpdatesTab = !state.appearance.showUpdatesTab;
    },
    toggleShowHistoryTab: state => {
      state.appearance.showHistoryTab = !state.appearance.showHistoryTab;
    },
    toggleShowLabelsInNav: state => {
      state.appearance.showLabelsInNav = !state.appearance.showLabelsInNav;
    },
    setReaderTheme: (state, action: PayloadAction<ReaderTheme>) => {
      state.reader.backgroundColor = action.payload.backgroundColor;
      state.reader.textColor = action.payload.textColor;
    },
    setReaderFont: (state, action: PayloadAction<{fontFamily: string}>) => {
      state.reader.fontFamily = action.payload.fontFamily;
    },
    setReaderPadding: (
      state,
      action: PayloadAction<{paddingHorizontal: number}>,
    ) => {
      state.reader.paddingHorizontal = action.payload.paddingHorizontal;
    },
    setReaderFontSize: (state, action: PayloadAction<{fontSize: number}>) => {
      state.reader.fontSize = action.payload.fontSize;
    },
    setReaderLineHeight: (
      state,
      action: PayloadAction<{lineHeight: number}>,
    ) => {
      state.reader.lineHeight = action.payload.lineHeight;
    },
    setCustomCSS: (state, action: PayloadAction<{customCSS: string}>) => {
      state.reader.customCSS = action.payload.customCSS;
    },
    toggleReaderFullScreenMode: state => {
      state.reader.fullScreenMode = !state.reader.fullScreenMode;
    },
    setLibraryFilter: (state, action: PayloadAction<{filter: string}>) => {
      if (state.library.filters.includes(action.payload.filter)) {
        state.library.filters = state.library.filters.filter(
          item => item !== action.payload.filter,
        );
      } else {
        state.library.filters = [
          ...state.library.filters,
          action.payload.filter,
        ];
      }
    },
    setLibrarySortOrder: (state, action: PayloadAction<{sort: string}>) => {
      state.library.sort = action.payload.sort;
    },
    toggleShowUnreadBadge: state => {
      state.library.showUnreadBadge = !state.library.showUnreadBadge;
    },
    toggleShowDownloadsBadge: state => {
      state.library.showDownloadsBadge = !state.library.showDownloadsBadge;
    },
  },
});

export const {
  setTheme,
  setDisplayMode,
  toggleShowUpdatesTab,
  toggleShowHistoryTab,
  toggleShowLabelsInNav,
  setReaderTheme,
  setReaderFont,
  setReaderPadding,
  setReaderFontSize,
  setReaderLineHeight,
  setCustomCSS,
  toggleReaderFullScreenMode,
  setLibraryFilter,
  setLibrarySortOrder,
  toggleShowUnreadBadge,
  toggleShowDownloadsBadge,
} = settingsSlice.actions;

export default settingsSlice.reducer;
