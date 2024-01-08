import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { defaultTo } from 'lodash-es';
import WebView from 'react-native-webview';
import { Portal } from 'react-native-paper';

import {
  Appbar,
  Button,
  ColorPreferenceItem,
  List,
  SwitchItem,
} from '@components/index';
import ReaderThemeSelector from '@screens/reader/components/ReaderBottomSheet/ReaderThemeSelector';
import ReaderTextAlignSelector from '@screens/reader/components/ReaderBottomSheet/ReaderTextAlignSelector';
import ColorPickerModal from '@components/ColorPickerModal/ColorPickerModal';
import FontPickerModal from './FontPickerModal';
import ReaderLineHeight from '@screens/reader/components/ReaderBottomSheet/ReaderLineHeight';
import ReaderTextSize from './ReaderTextSize';

import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useTheme,
} from '@hooks/persisted';
import { getString } from '@strings/translations';

import { dummyHTML } from './utils';
import { useBoolean } from '@hooks';
import {
  presetReaderThemes,
  readerFonts,
} from '@utils/constants/readerConstants';

const READER_HEIGHT = 360;

export type TextAlignments =
  | 'left'
  | 'center'
  | 'auto'
  | 'right'
  | 'justify'
  | undefined;

const SettingsReaderScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const readerSettings = useChapterReaderSettings();
  const {
    useVolumeButtons,
    verticalSeekbar,
    swipeGestures,
    autoScroll,
    autoScrollInterval,
    autoScrollOffset,
    fullScreenMode,
    showScrollPercentage,
    showBatteryAndTime,
    setChapterGeneralSettings,
  } = useChapterGeneralSettings();

  const webViewCSS = `
  <style>
  body {
    color: ${readerSettings.textColor};
    text-align: ${readerSettings.textAlign};
    line-height: ${readerSettings.lineHeight};
    font-size: ${readerSettings.textSize}px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: ${readerSettings.padding}%;
    padding-right: ${readerSettings.padding}%;
    font-family: ${readerSettings.fontFamily}; 
  }
  </style>
  <style>
    ${readerSettings.customCSS}
    @font-face {
      font-family: ${readerSettings.fontFamily};
      src: url("file:///android_asset/fonts/${readerSettings.fontFamily}.ttf");
    }
  </style>
  `;

  const readerBackgroundColor = readerSettings.theme;

  const readerBackgroundModal = useBoolean();
  const readerTextColorModal = useBoolean();
  const readerFontPickerModal = useBoolean();

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

  const areAutoScrollSettingsDefault =
    autoScrollInterval === 10 && autoScrollOffset === null;

  const [customCSS, setcustomCSS] = useState(readerSettings.customCSS);
  const [customJS, setcustomJS] = useState(readerSettings.customJS);

  const { height: screenHeight } = useWindowDimensions();

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];

  return (
    <>
      <Appbar
        mode="small"
        title={getString('moreScreen.settingsScreen.readerSettings.title')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />

      <View style={{ height: READER_HEIGHT }}>
        <WebView
          originWhitelist={['*']}
          style={{ backgroundColor: readerBackgroundColor }}
          nestedScrollEnabled={true}
          source={{
            html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                ${webViewCSS}
              </head>
              <body>
                <chapter>
                  ${dummyHTML}
                  <script>
                    async function fn(){${readerSettings.customJS}}
                    document.addEventListener("DOMContentLoaded", fn);
                  </script>
                </chapter>
              </body>
            </html>
            `,
          }}
        />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.bottomInset}
      >
        <SwitchItem
          label={getString('readerScreen.bottomSheet.verticalSeekbar')}
          description={getString(
            'moreScreen.settingsScreen.readerSettings.verticalSeekbarDesc',
          )}
          value={verticalSeekbar}
          onPress={() =>
            setChapterGeneralSettings({ verticalSeekbar: !verticalSeekbar })
          }
          theme={theme}
        />
        <SwitchItem
          label={getString('readerScreen.bottomSheet.volumeButtonsScroll')}
          value={useVolumeButtons}
          onPress={() =>
            setChapterGeneralSettings({ useVolumeButtons: !useVolumeButtons })
          }
          theme={theme}
        />
        <SwitchItem
          label={getString('readerScreen.bottomSheet.swipeGestures')}
          value={swipeGestures}
          onPress={() =>
            setChapterGeneralSettings({ swipeGestures: !swipeGestures })
          }
          theme={theme}
        />
        <SwitchItem
          label={getString('readerScreen.bottomSheet.autoscroll')}
          value={autoScroll}
          onPress={() => setChapterGeneralSettings({ autoScroll: !autoScroll })}
          theme={theme}
        />
        {autoScroll ? (
          <>
            <List.Divider theme={theme} />
            <List.SubHeader theme={theme}>
              {getString('readerScreen.bottomSheet.autoscroll')}
            </List.SubHeader>
            <View style={styles.autoScrollInterval}>
              <Text
                style={[labelStyle, styles.paddingRightM]}
                numberOfLines={2}
              >
                {getString(
                  'moreScreen.settingsScreen.readerSettings.autoScrollInterval',
                )}
              </Text>
              <TextInput
                style={labelStyle}
                defaultValue={defaultTo(autoScrollInterval, 10).toString()}
                keyboardType="numeric"
                onChangeText={text => {
                  if (text) {
                    setChapterGeneralSettings({
                      autoScrollInterval: Number(text),
                    });
                  }
                }}
              />
            </View>
            <View style={styles.autoScrollInterval}>
              <Text
                style={[labelStyle, styles.paddingRightM]}
                numberOfLines={2}
              >
                {getString(
                  'moreScreen.settingsScreen.readerSettings.autoScrollOffset',
                )}
              </Text>
              <TextInput
                style={labelStyle}
                defaultValue={defaultTo(
                  autoScrollOffset,
                  Math.round(screenHeight),
                ).toString()}
                keyboardType="numeric"
                onChangeText={text => {
                  if (text) {
                    setChapterGeneralSettings({
                      autoScrollOffset: Number(text),
                    });
                  }
                }}
              />
            </View>
            {!areAutoScrollSettingsDefault ? (
              <View style={styles.customCSSButtons}>
                <Button
                  style={styles.customThemeButton}
                  title={getString('common.reset')}
                  onPress={() => {
                    setChapterGeneralSettings({
                      autoScrollInterval: 10,
                      autoScrollOffset: null,
                    });
                  }}
                />
              </View>
            ) : null}
          </>
        ) : null}
        <>
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('moreScreen.settingsScreen.readerSettings.customCSS')}
          </List.SubHeader>
          <View style={styles.customCSSContainer}>
            <TextInput
              style={[{ color: theme.onSurface }, styles.fontSizeL]}
              value={customCSS}
              onChangeText={text => setcustomCSS(text)}
              placeholderTextColor={theme.onSurfaceVariant}
              placeholder="Example: body { color: red; }"
              multiline={true}
            />
            <View style={styles.customCSSButtons}>
              <Button
                onPress={() =>
                  readerSettings.setChapterReaderSettings({
                    customCSS: customCSS,
                  })
                }
                style={styles.marginLeftS}
                title={getString('common.save')}
              />
              <Button
                onPress={() =>
                  readerSettings.setChapterReaderSettings({ customCSS: '' })
                }
                title={getString('common.clear')}
              />
            </View>
          </View>

          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {/* {getString('moreScreen.settingsScreen.readerSettings.customJS')} */}
            {'Custom JS'}
          </List.SubHeader>
          <View style={styles.customCSSContainer}>
            <TextInput
              style={[{ color: theme.onSurface }, styles.fontSizeL]}
              value={customJS}
              onChangeText={text => setcustomJS(text)}
              placeholderTextColor={theme.onSurfaceVariant}
              placeholder="Example: document.getElementById('example');"
              multiline={true}
            />
            <View style={styles.customCSSButtons}>
              <Button
                onPress={() =>
                  readerSettings.setChapterReaderSettings({
                    customJS: customJS,
                  })
                }
                style={styles.marginLeftS}
                title={getString('common.save')}
              />
              <Button
                onPress={() =>
                  readerSettings.setChapterReaderSettings({ customJS: '' })
                }
                title={getString('common.clear')}
              />
            </View>
          </View>
        </>
        <List.Divider theme={theme} />
        <List.SubHeader theme={theme}>
          {getString('novelScreen.bottomSheet.display')}
        </List.SubHeader>
        <SwitchItem
          label={getString('readerScreen.bottomSheet.fullscreen')}
          value={fullScreenMode}
          onPress={() =>
            setChapterGeneralSettings({ fullScreenMode: !fullScreenMode })
          }
          theme={theme}
        />
        <SwitchItem
          label={getString('readerScreen.bottomSheet.showProgressPercentage')}
          value={showScrollPercentage}
          onPress={() =>
            setChapterGeneralSettings({
              showScrollPercentage: !showScrollPercentage,
            })
          }
          theme={theme}
        />
        <SwitchItem
          label={getString('readerScreen.bottomSheet.showBatteryAndTime')}
          value={showBatteryAndTime}
          onPress={() =>
            setChapterGeneralSettings({
              showBatteryAndTime: !showBatteryAndTime,
            })
          }
          theme={theme}
        />
        <List.Divider theme={theme} />
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
          label={getString(
            'moreScreen.settingsScreen.readerSettings.textColor',
          )}
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
              title={getString(
                'moreScreen.settingsScreen.readerSettings.saveCustomTheme',
              )}
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
        <ReaderLineHeight labelStyle={labelStyle} />
        <List.Item
          title={getString('readerScreen.bottomSheet.fontStyle')}
          description={currentFontName}
          onPress={readerFontPickerModal.setTrue}
          theme={theme}
        />
      </ScrollView>
      <Portal>
        <ColorPickerModal
          title={getString(
            'moreScreen.settingsScreen.readerSettings.backgroundColor',
          )}
          visible={readerBackgroundModal.value}
          color={readerSettings.theme}
          closeModal={readerBackgroundModal.setFalse}
          theme={theme}
          onSubmit={color =>
            readerSettings.setChapterReaderSettings({ theme: color })
          }
        />
        <ColorPickerModal
          title={getString(
            'moreScreen.settingsScreen.readerSettings.textColor',
          )}
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

export default SettingsReaderScreen;

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
