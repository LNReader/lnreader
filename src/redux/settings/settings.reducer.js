import {
  SET_APP_THEME,
  SET_NOVELS_PER_ROW,
  SET_READER_SETTINGS,
  SET_APP_SETTINGS,
  SET_ACCENT_COLOR,
  SET_RIPPLE_COLOR,
  SET_AMOLED_MODE,
} from './settings.types';
import {
  lightTheme,
  darkTheme,
  midnightDuskTheme,
  greenAppleTheme,
  irisBlueTheme,
  strawberryDaiquiri,
  takoTheme,
  yinYangTheme,
  springBlossomTheme,
  colorsAmoled,
  oceanicTheme,
  yangTheme,
  yotsubaTheme,
  takoLightTheme,
  tealTheme,
} from '../../theme/theme.ts';

const themes = {
  1: lightTheme,
  2: darkTheme,
  3: midnightDuskTheme,
  4: greenAppleTheme,
  5: irisBlueTheme,
  6: oceanicTheme,
  7: strawberryDaiquiri,
  8: takoTheme,
  9: yinYangTheme,
  10: springBlossomTheme,
  11: yangTheme,
  12: yotsubaTheme,
  13: takoLightTheme,
  14: tealTheme,
};

/**
 * Display Mode
 *
 * 0 -> Compact
 * 1 -> Comfortable
 * 2 -> List
 * 3 -> No title
 */

export const initialState = {
  /**
   * General settings
   */

  incognitoMode: false,

  /**
   * Appearence settings
   */

  theme: darkTheme,
  displayMode: 0,
  novelsPerRow: 3,
  showHistoryTab: true,
  showUpdatesTab: true,
  showLabelsInNav: false,
  useFabForContinueReading: false,

  /**
   * Library settings
   */

  showDownloadBadges: true,
  showUnreadBadges: true,
  showNumberOfNovels: false,
  downloadedOnlyMode: false,

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
  defaultChapterSort: 'ORDER BY chapterId ASC',

  /**
   * Reader settings
   */

  fullScreenMode: true,
  swipeGestures: false,
  showScrollPercentage: true,
  useWebViewForChapter: false,
  showBatteryAndTime: false,
  autoScroll: false,
  autoScrollInterval: 10,
  autoScrollOffset: null,
  textSelectable: false,
  verticalSeekbar: true,

  reader: {
    theme: '#292832',
    textColor: '#CCCCCC',
    textSize: 16,
    textAlign: 'left',
    padding: 5,
    fontFamily: '',
    lineHeight: 1.5,
    customCSS: '',
  },
};

const settingsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_APP_THEME:
      return { ...state, theme: themes[payload] };
    case SET_NOVELS_PER_ROW:
      return {
        ...state,
        novelsPerRow: state.displayMode !== 2 ? payload : 1,
      };
    case SET_ACCENT_COLOR:
      return {
        ...state,
        theme: {
          ...state.theme,
          colorAccent: payload,
        },
      };
    case SET_RIPPLE_COLOR:
      return {
        ...state,
        theme: {
          ...state.theme,
          rippleColor: payload,
        },
      };
    case SET_AMOLED_MODE:
      return {
        ...state,
        theme: payload.val
          ? {
              ...colorsAmoled,
              colorAccent: state.theme.colorAccent,
              rippleColor: state.theme.rippleColor,
              colorButtonText: state.theme.colorButtonText,
              id: state.theme.id,
              name: state.theme.name,
            }
          : themes[payload.id],
      };

    case SET_APP_SETTINGS:
      return {
        ...state,
        [payload.key]: payload.val,
      };
    case SET_READER_SETTINGS:
      return {
        ...state,
        reader: {
          ...state.reader,
          [payload.key]: payload.val,
        },
      };
    default:
      return state;
  }
};

export default settingsReducer;
