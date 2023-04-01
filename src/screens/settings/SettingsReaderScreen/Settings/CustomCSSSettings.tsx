import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';

import { defaultTo } from 'lodash-es';

import {
  Button,
  ColorPreferenceItem,
  List,
  SwitchItem,
} from '@components/index';
import ReaderThemeSelector from '../../../../screens/reader/components/ReaderBottomSheet/ReaderThemeSelector';
import ReaderTextAlignSelector from '../../../../screens/reader/components/ReaderBottomSheet/ReaderTextAlignSelector';
import ReaderLineHeight from '../../../../screens/reader/components/ReaderBottomSheet/ReaderLineHeight';
import ReaderTextSize from '../ReaderTextSize';

import {
  useReaderSettings,
  useSettingsV1,
  useAppDispatch,
  useSettingsV2,
} from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import {
  setAppSettings,
  setReaderSettings,
} from '@redux/settings/settings.actions';

import useBoolean from '@hooks/useBoolean';
import {
  deleteCustomReaderTheme,
  saveCustomReaderTheme,
} from '@redux/settings/settingsSlice';
import {
  presetReaderThemes,
  readerFonts,
} from '../../../../utils/constants/readerConstants';

export type TextAlignments =
  | 'left'
  | 'center'
  | 'auto'
  | 'right'
  | 'justify'
  | undefined;

const CustomCSSSettings = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const readerSettings = useReaderSettings();
  const {
    useVolumeButtons = false,
    verticalSeekbar = true,
    swipeGestures = false,
    autoScroll = false,
    autoScrollInterval = 10,
    autoScrollOffset = null,
    fullScreenMode = true,
    showScrollPercentage = true,
    showBatteryAndTime = false,
  } = useSettingsV1();

  const {
    reader: { customThemes = [] },
  } = useSettingsV2();
  const readerBackgroundModal = useBoolean();
  const readerTextColorModal = useBoolean();
  const readerFontPickerModal = useBoolean();

  const isCurrentThemeCustom = customThemes.some(
    item =>
      item.backgroundColor === readerSettings.theme &&
      item.textColor === readerSettings.textColor,
  );

  const isCurrentThemePreset = presetReaderThemes.some(
    item =>
      item.backgroundColor === readerSettings.theme &&
      item.textColor === readerSettings.textColor,
  );

  const currentFontName = readerFonts.find(
    item => item.fontFamily === readerSettings.fontFamily,
  )?.name;

  const areAutoScrollSettingsDefault =
    autoScrollInterval === 10 && autoScrollOffset === null;

  const [customCSS, setcustomCSS] = useState(readerSettings.customCSS);
  const [customJS, setcustomJS] = useState(readerSettings.customJS);

  const { height: screenHeight } = useWindowDimensions();

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.bottomInset}
    ></ScrollView>
  );
};
export default CustomCSSSettings;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bottomInset: {
    paddingBottom: 40,
  },
  fontSizeL: {
    fontSize: 16,
  },
  autoScrollInterval: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customThemeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  customCSSContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  paddingRightM: {
    flex: 1,
    paddingRight: 16,
  },
});
