import { StyleSheet, View } from 'react-native';
import React from 'react';

import { Button, ColorPreferenceItem, List } from '@components/index';

import { useChapterReaderSettings } from '@hooks/persisted';
import { useTheme } from '@providers/ThemeProvider';
import { getString } from '@strings/translations';
import ReaderTextAlignSelector from '@screens/reader/components/ReaderBottomSheet/ReaderTextAlignSelector';
import ReaderTextSize from '../ReaderTextSize';
import ReaderValueChange from '@screens/reader/components/ReaderBottomSheet/ReaderValueChange';
import ReaderThemeSelector from '@screens/reader/components/ReaderBottomSheet/ReaderThemeSelector';
import {
  presetReaderThemes,
  readerFonts,
} from '@utils/constants/readerConstants';
import { useBoolean } from '@hooks';
import { Portal } from 'react-native-paper';
import ColorPickerModal from '@components/ColorPickerModal/ColorPickerModal';
import FontPickerModal from '../Modals/FontPickerModal';

const ReaderThemeSettings = () => {
  const theme = useTheme();
  const readerSettings = useChapterReaderSettings();

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];
  const readerFontPickerModal = useBoolean();
  const readerBackgroundModal = useBoolean();
  const readerTextColorModal = useBoolean();

  const isCurrentThemeCustom = readerSettings.customThemes.some(
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

  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('readerSettings.readerTheme')}
      </List.SubHeader>
      <ReaderThemeSelector
        label={getString('readerSettings.preset')}
        labelStyle={labelStyle}
      />
      <ColorPreferenceItem
        label={getString('readerSettings.backgroundColor')}
        description={readerSettings.theme}
        onPress={readerBackgroundModal.setTrue}
        theme={theme}
      />
      <ColorPreferenceItem
        label={getString('readerSettings.textColor')}
        description={readerSettings.textColor}
        onPress={readerTextColorModal.setTrue}
        theme={theme}
      />
      {isCurrentThemeCustom ? (
        <View style={styles.customCSSButtons}>
          <Button
            style={styles.customThemeButton}
            title={getString('readerSettings.deleteCustomTheme')}
            onPress={() =>
              readerSettings.deleteCustomReaderTheme({
                backgroundColor: readerSettings.theme,
                textColor: readerSettings.textColor,
              })
            }
          />
        </View>
      ) : !isCurrentThemePreset ? (
        <View style={styles.customCSSButtons}>
          <Button
            style={styles.customThemeButton}
            title={getString('readerSettings.saveCustomTheme')}
            onPress={() =>
              readerSettings.saveCustomReaderTheme({
                backgroundColor: readerSettings.theme,
                textColor: readerSettings.textColor,
              })
            }
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
      <List.Item
        title={getString('readerScreen.bottomSheet.fontStyle')}
        description={currentFontName}
        onPress={readerFontPickerModal.setTrue}
        theme={theme}
      />
      {/*
            Modals
        */}
      <Portal>
        <ColorPickerModal
          title={getString('readerSettings.backgroundColor')}
          visible={readerBackgroundModal.value}
          color={readerSettings.theme}
          closeModal={readerBackgroundModal.setFalse}
          theme={theme}
          onSubmit={color =>
            readerSettings.setChapterReaderSettings({ theme: color })
          }
        />
        <ColorPickerModal
          title={getString('readerSettings.textColor')}
          visible={readerTextColorModal.value}
          color={readerSettings.textColor}
          closeModal={readerTextColorModal.setFalse}
          theme={theme}
          onSubmit={color =>
            readerSettings.setChapterReaderSettings({ textColor: color })
          }
        />
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

const styles = StyleSheet.create({
  bottomInset: {
    paddingBottom: 40,
  },
  buttons: {
    flex: 1,
  },
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
    marginVertical: 8,
  },
  customCSSContainer: {
    marginBottom: 8,
    marginHorizontal: 16,
  },
  customThemeButton: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  fontSizeL: {
    fontSize: 16,
  },
});
