import { ScrollView, View } from 'react-native';
import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';

import { Appbar, List } from '@components/index';

import { useReaderSettings } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';

import { dummyHTML } from './utils';
import GeneralSettings from './Settings/GeneralSettings';
import CustomCSSSettings from './Settings/CustomCSSSettings';
import {
  settingEnum,
  READER_HEIGHT,
} from './constants/readerSettingsConstants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomJSSettings from './Settings/CustomJSSettings';
import DisplaySettings from './Settings/DisplaySettings';
import ReaderThemeSettings from './Settings/ReaderThemeSettings';

const SettingsReaderScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  let { bottom } = useSafeAreaInsets();

  const readerSettings = useReaderSettings();
  const [setting, setSetting] = useState(settingEnum.DEFAULT);

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

  const handleGoBack = () => {
    if (setting === settingEnum.DEFAULT) {
      navigation.goBack();
    } else {
      setSetting(settingEnum.DEFAULT);
    }
  };

  return (
    <>
      <Appbar
        mode="small"
        title={getString('moreScreen.settingsScreen.readerSettings.title')}
        handleGoBack={handleGoBack}
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
                ${dummyHTML}
                <script>
                  async function fn(){${readerSettings.customJS}}
                  document.addEventListener("DOMContentLoaded", fn);
                </script>
              </body>
            </html>
            `,
          }}
        />
      </View>

      <ScrollView>
        <View style={{ paddingBottom: bottom }}>
          <GeneralSettings />
          <List.Divider theme={theme} />
          <CustomCSSSettings />
          <List.Divider theme={theme} />
          <CustomJSSettings readerSettings={readerSettings} />
          <List.Divider theme={theme} />
          <DisplaySettings />
          <List.Divider theme={theme} />
          <ReaderThemeSettings />
        </View>
      </ScrollView>
    </>
  );
};

export default SettingsReaderScreen;
