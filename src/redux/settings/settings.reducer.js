import { SET_READER_SETTINGS, SET_APP_SETTINGS } from './settings.types';

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

const settingsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
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
