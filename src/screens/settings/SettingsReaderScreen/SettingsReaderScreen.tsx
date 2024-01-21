import { View, ScrollView } from 'react-native';
import React from 'react';

import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { dummyHTML } from './utils';

import { Appbar, List } from '@components/index';

import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

import GeneralSettings from './Settings/GeneralSettings';
import CustomCSSSettings from './Settings/CustomCSSSettings';
import CustomJSSettings from './Settings/CustomJSSettings';
import DisplaySettings from './Settings/DisplaySettings';
import ReaderThemeSettings from './Settings/ReaderThemeSettings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { bottom } = useSafeAreaInsets();

  const readerSettings = useChapterReaderSettings();
  const READER_HEIGHT = 280;
  const dummyChapterInfo = {
    sourceId: 11,
    chapterId: 99,
    novelId: 20,
    novelName: 'novel name',
    chapterName: "chapter' name",
  };
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
                <chapter 
                  data-novel-id='${dummyChapterInfo.novelId}'
                  data-chapter-id='${dummyChapterInfo.chapterId}'
                >
                  ${dummyHTML}
                </chapter>
                <script>
                  async function fn(){
                    let novelName = "${dummyChapterInfo.novelName}";
                    let chapterName = "${dummyChapterInfo.chapterName}";
                    let sourceId =${dummyChapterInfo.sourceId};
                    let chapterId =${dummyChapterInfo.chapterId};
                    let novelId =${dummyChapterInfo.novelId};
                    let html = document.getElementsByTagName("chapter")[0].innerHTML;
                    ${readerSettings.customJS}
                  }
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
          <CustomJSSettings />
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
