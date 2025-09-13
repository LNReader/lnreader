import { StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';

import { Button, List } from '@components/index';

import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import ReaderTextAlignSelector from '@screens/reader/components/ReaderBottomSheet/ReaderTextAlignSelector';
import ReaderTextSize from './ReaderTextSize';
import ReaderValueChange from '@screens/reader/components/ReaderBottomSheet/ReaderValueChange';
import ReaderThemeSelector from '@screens/reader/components/ReaderBottomSheet/ReaderThemeSelector';
import { readerFonts } from '@utils/constants/readerConstants';
import { useBoolean } from '@hooks';
import { Portal } from 'react-native-paper';
import FontPickerModal from '../modals/FontPickerModal';
import ReaderFontPicker from '@screens/reader/components/ReaderBottomSheet/ReaderFontPicker';
import ColorPickerModal from '../modals/ColorPickerModal';
import { BaseSetting, ColorPickerSetting } from '@screens/settings/Settings';
import { useSettingsContext } from '@components/Context/SettingsContext';
import {
  isCurrentThemeCustom,
  isCurrentThemePreset,
} from '../utils/themeUtils';
import { sharedStyles } from '../utils/sharedStyles';

const ReaderThemeSettings = ({
  quickSettings,
}: {
  quickSettings?: boolean;
}) => {
  const theme = useTheme();
  const readerSettings = useSettingsContext();

  const labelStyle = [
    {
      color: quickSettings ? theme.onSurfaceVariant : theme.onSurface,
      fontSize: quickSettings ? 14 : 16,
    },
  ];
  const readerFontPickerModal = useBoolean();

  const currentTheme = useMemo(
    () => ({
      backgroundColor: readerSettings.backgroundColor,
      textColor: readerSettings.textColor,
    }),
    [readerSettings.backgroundColor, readerSettings.textColor],
  );

  const isCustomTheme = useMemo(
    () => isCurrentThemeCustom(currentTheme, readerSettings.customThemes),
    [currentTheme, readerSettings.customThemes],
  );

  const isPresetTheme = useMemo(
    () => isCurrentThemePreset(currentTheme),
    [currentTheme],
  );

  const currentFontName = readerFonts.find(
    item => item.fontFamily === readerSettings.fontFamily,
  )?.name;

  const backgroundColorSetting = useMemo<ColorPickerSetting & BaseSetting>(
    () => ({
      title: getString('readerSettings.backgroundColor'),
      description: (s: string) => s,
      type: 'ColorPicker',
      valueKey: 'backgroundColor',
    }),
    [],
  );

  const textColorSetting = useMemo<ColorPickerSetting & BaseSetting>(
    () => ({
      title: getString('readerSettings.textColor'),
      description: (s: string) => s,
      type: 'ColorPicker',
      valueKey: 'textColor',
    }),
    [],
  );

  return (
    <>
      <ReaderThemeSelector
        label={getString('readerSettings.preset')}
        labelStyle={labelStyle}
      />
      {!quickSettings ? (
        <>
          <ColorPickerModal settings={backgroundColorSetting} theme={theme} />
          <ColorPickerModal settings={textColorSetting} theme={theme} />
        </>
      ) : null}
      {isCustomTheme ? (
        <View
          style={[
            sharedStyles.marginVertical,
            sharedStyles.flex,
            sharedStyles.flexRowReverse,
          ]}
        >
          <Button
            style={sharedStyles.button}
            title={getString('readerSettings.deleteCustomTheme')}
            onPress={() => readerSettings.deleteCustomReaderTheme(currentTheme)}
          />
        </View>
      ) : !isPresetTheme ? (
        <View
          style={[
            sharedStyles.marginVertical,
            sharedStyles.flex,
            sharedStyles.flexRowReverse,
          ]}
        >
          <Button
            style={sharedStyles.button}
            title={getString('readerSettings.saveCustomTheme')}
            onPress={() => readerSettings.saveCustomReaderTheme(currentTheme)}
          />
        </View>
      ) : null}
      <ReaderTextAlignSelector labelStyle={labelStyle} />
      <ReaderTextSize labelStyle={labelStyle} />
      <ReaderValueChange
        labelStyle={labelStyle}
        label={getString('readerScreen.bottomSheet.lineHeight')}
        valueKey="lineHeight"
      />
      <ReaderValueChange
        labelStyle={labelStyle}
        label={getString('readerScreen.bottomSheet.padding')}
        valueKey="padding"
        valueChange={2}
        min={0}
        max={50}
        decimals={0}
        unit="px"
      />
      {!quickSettings ? (
        <List.Item
          title={getString('readerScreen.bottomSheet.fontStyle')}
          description={currentFontName}
          onPress={readerFontPickerModal.setTrue}
          theme={theme}
        />
      ) : (
        <ReaderFontPicker />
      )}
      {/*
            Modals
        */}
      <Portal>
        <FontPickerModal
          currentFont={readerSettings.fontFamily}
          visible={readerFontPickerModal.value}
          onDismiss={readerFontPickerModal.setFalse}
        />
      </Portal>
    </>
  );
};
export default ReaderThemeSettings;

// Using shared styles instead of local styles
