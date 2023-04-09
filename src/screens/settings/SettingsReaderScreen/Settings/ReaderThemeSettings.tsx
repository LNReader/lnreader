import { StyleSheet, View } from 'react-native';
import React from 'react';

import { Button, ColorPreferenceItem, List } from '@components/index';

import { setReaderSettings } from '@redux/settings/settings.actions';

import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useReaderSettings, useSettingsV2 } from '@redux/hooks';
import { getString } from '@strings/translations';
import ReaderTextAlignSelector from '@screens/reader/components/ReaderBottomSheet/ReaderTextAlignSelector';
import ReaderTextSize from '../ReaderTextSize';
import ReaderLineHeight from '@screens/reader/components/ReaderBottomSheet/ReaderLineHeight';
import {
  deleteCustomReaderTheme,
  saveCustomReaderTheme,
} from '@redux/settings/settingsSlice';
import ReaderThemeSelector from '@screens/reader/components/ReaderBottomSheet/ReaderThemeSelector';
import {
  presetReaderThemes,
  readerFonts,
} from '@utils/constants/readerConstants';
import useBoolean from '@hooks/useBoolean';
import { Portal } from 'react-native-paper';
import ColorPickerModal from '@components/ColorPickerModal/ColorPickerModal';
import FontPickerModal from '../Modals/FontPickerModal';

const ReaderThemeSettings = () => {
  const theme = useTheme();
  const readerSettings = useReaderSettings();
  const dispatch = useAppDispatch();

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];
  const readerFontPickerModal = useBoolean();
  const readerBackgroundModal = useBoolean();
  const readerTextColorModal = useBoolean();

  const {
    reader: { customThemes = [] },
  } = useSettingsV2();

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

  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('moreScreen.settingsScreen.readerSettings.readerTheme')}
      </List.SubHeader>
      <ReaderThemeSelector
        label={getString('moreScreen.settingsScreen.readerSettings.preset')}
        labelStyle={labelStyle}
      />
      <ColorPreferenceItem
        label={getString(
          'moreScreen.settingsScreen.readerSettings.backgroundColor',
        )}
        description={readerSettings.theme}
        onPress={readerBackgroundModal.setTrue}
        theme={theme}
      />
      <ColorPreferenceItem
        label={getString('moreScreen.settingsScreen.readerSettings.textColor')}
        description={readerSettings.textColor}
        onPress={readerTextColorModal.setTrue}
        theme={theme}
      />
      {isCurrentThemeCustom ? (
        <View style={styles.customCSSButtons}>
          <Button
            style={styles.customThemeButton}
            title={getString(
              'moreScreen.settingsScreen.readerSettings.deleteCustomTheme',
            )}
            onPress={() =>
              dispatch(
                deleteCustomReaderTheme({
                  theme: {
                    backgroundColor: readerSettings.theme,
                    textColor: readerSettings.textColor,
                  },
                }),
              )
            }
          />
        </View>
      ) : !isCurrentThemePreset ? (
        <View style={styles.customCSSButtons}>
          <Button
            style={styles.customThemeButton}
            title={getString(
              'moreScreen.settingsScreen.readerSettings.saveCustomTheme',
            )}
            onPress={() =>
              dispatch(
                saveCustomReaderTheme({
                  theme: {
                    backgroundColor: readerSettings.theme,
                    textColor: readerSettings.textColor,
                  },
                }),
              )
            }
          />
        </View>
      ) : null}
      <ReaderTextAlignSelector labelStyle={labelStyle} />
      <ReaderTextSize labelStyle={labelStyle} />
      <ReaderLineHeight labelStyle={labelStyle} />
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
          title={getString(
            'moreScreen.settingsScreen.readerSettings.backgroundColor',
          )}
          visible={readerBackgroundModal.value}
          color={readerSettings.theme}
          closeModal={readerBackgroundModal.setFalse}
          theme={theme}
          onSubmit={color => dispatch(setReaderSettings('theme', color))}
        />
        <ColorPickerModal
          title={getString(
            'moreScreen.settingsScreen.readerSettings.textColor',
          )}
          visible={readerTextColorModal.value}
          color={readerSettings.textColor}
          closeModal={readerTextColorModal.setFalse}
          theme={theme}
          onSubmit={color => dispatch(setReaderSettings('textColor', color))}
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
  flex: {
    flex: 1,
  },
  bottomInset: {
    paddingBottom: 40,
  },
  fontSizeL: {
    fontSize: 16,
  },
  customCSSContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  buttons: {
    flex: 1,
  },
  customCSSButtons: {
    marginVertical: 8,
    flex: 1,
    flexDirection: 'row-reverse',
  },
  customThemeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
