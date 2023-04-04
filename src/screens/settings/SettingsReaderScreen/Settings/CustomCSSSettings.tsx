import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useState } from 'react';

import { Button, ColorPreferenceItem, List } from '@components/index';

import { setReaderSettings } from '@redux/settings/settings.actions';

import PlusMinusField from '@components/PlusMinusField/PlusMinusField';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useReaderSettings, useSettingsV2 } from '@redux/hooks';
import { getString } from '@strings/translations';
import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework } from 'expo-file-system';
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
import FontPickerModal from '../FontPickerModal';

const CustomCSSSettings = () => {
  const theme = useTheme();
  const readerSettings = useReaderSettings();
  const [customCSS, setCustomCSS] = useState(readerSettings.customCSS);
  const dispatch = useAppDispatch();

  const [horizontalSpace, setHorizontalSpace] = useState(0);
  const [maxWidth, setmaxWidth] = useState(100);

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];
  const readerFontPickerModal = useBoolean();
  const readerBackgroundModal = useBoolean();
  const readerTextColorModal = useBoolean();

  const openCSS = async () => {
    try {
      const rawCSS = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
        type: 'text/css',
      });
      if (rawCSS.type === 'success') {
        let css = await StorageAccessFramework.readAsStringAsync(rawCSS.uri);
        setCustomCSS(css);
      }
    } catch (error) {
      console.error(error);
    }
  };
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
    <ScrollView style={styles.flex} contentContainerStyle={styles.bottomInset}>
      <List.Divider theme={theme} />
      {/*
          Reader Theme
      */}
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
      <List.Divider theme={theme} />
      <List.SubHeader theme={theme}>Spacing</List.SubHeader>
      <PlusMinusField
        labelStyle={labelStyle}
        label="Horizontal Margin"
        value={horizontalSpace}
        method={val => setHorizontalSpace(val)}
        min={0}
      />
      <PlusMinusField
        labelStyle={labelStyle}
        label="Max Width"
        value={maxWidth}
        method={val => setmaxWidth(val)}
        valueChange={50}
        min={100}
      />
      <List.Divider theme={theme} />
      <List.SubHeader theme={theme}>CSS file</List.SubHeader>
      <KeyboardAvoidingView behavior="height">
        <TextInput
          style={[
            { color: theme.onSurface },
            styles.fontSizeL,
            styles.customCSSContainer,
          ]}
          value={customCSS}
          onChangeText={text => setCustomCSS(text)}
          placeholderTextColor={theme.onSurfaceVariant}
          placeholder="Example: body {margin: 10px;}"
          multiline={true}
        />
      </KeyboardAvoidingView>
      <View style={styles.customCSSContainer}>
        <Button
          onPress={() => dispatch(setReaderSettings('customCSS', customCSS))}
          style={styles.buttons}
          mode="contained"
          title={getString('common.save')}
        />
        <View style={styles.customCSSButtons}>
          <Button
            onPress={openCSS}
            style={styles.buttons}
            title="Open CSS file"
          />

          <Button
            onPress={() => {
              setCustomCSS('');
              dispatch(setReaderSettings('customCSS', ''));
            }}
            style={styles.buttons}
            title={getString('common.clear')}
          />
        </View>
      </View>
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
    </ScrollView>
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
