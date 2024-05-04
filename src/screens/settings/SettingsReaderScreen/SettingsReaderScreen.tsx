import { View, ScrollView, StatusBar, Dimensions } from 'react-native';
import React, { useMemo, useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { dummyHTML } from './utils';

import { Appbar, List } from '@components/index';

import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useTheme,
} from '@hooks/persisted';
import { getString } from '@strings/translations';

import GeneralSettings from './Settings/GeneralSettings';
import CustomCSSSettings from './Settings/CustomCSSSettings';
import CustomJSSettings from './Settings/CustomJSSettings';
import DisplaySettings from './Settings/DisplaySettings';
import ReaderThemeSettings from './Settings/ReaderThemeSettings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import color from 'color';
import { useBatteryLevel } from 'react-native-device-info';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { showToast } from '@utils/showToast';
import TextToSpeechSettings from './Settings/TextToSpeechSettings';

export type TextAlignments =
  | 'left'
  | 'center'
  | 'auto'
  | 'right'
  | 'justify'
  | undefined;

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string | number };
};

const SettingsReaderScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const { bottom } = useSafeAreaInsets();
  const [hidden, setHidden] = useState(true);
  const layoutHeight = Dimensions.get('window').height;
  const batteryLevel = useBatteryLevel();
  const readerSettings = useChapterReaderSettings();
  const {
    showScrollPercentage,
    showBatteryAndTime,
    verticalSeekbar,
    bionicReading,
  } = useChapterGeneralSettings();
  const READER_HEIGHT = 280;
  const assetsUriPrefix = useMemo(
    () => (__DEV__ ? 'http://localhost:8081/assets' : 'file:///android_asset'),
    [],
  );
  const dummyChapterInfo = {
    sourceId: 11,
    chapterId: 99,
    novelId: 20,
    novelName: 'novel name',
    chapterName: "chapter' name",
  };
  const webViewCSS = `
  <style>
    :root {
      --StatusBar-currentHeight: ${StatusBar.currentHeight};
      --readerSettings-theme: ${readerSettings.theme};
      --readerSettings-padding: ${readerSettings.padding}%;
      --readerSettings-textSize: ${readerSettings.textSize}px;
      --readerSettings-textColor: ${readerSettings.textColor};
      --readerSettings-textAlign: ${readerSettings.textAlign};
      --readerSettings-lineHeight: ${readerSettings.lineHeight};
      --readerSettings-fontFamily: ${readerSettings.fontFamily};
      --theme-primary: ${theme.primary};
      --theme-onPrimary: ${theme.onPrimary};
      --theme-secondary: ${theme.secondary};
      --theme-tertiary: ${theme.tertiary};
      --theme-onTertiary: ${theme.onTertiary};
      --theme-onSecondary: ${theme.onSecondary};
      --theme-surface: ${theme.surface};
      --theme-surface-0-9: ${color(theme.surface).alpha(0.9).toString()};
      --theme-onSurface: ${theme.onSurface};
      --theme-surfaceVariant: ${theme.surfaceVariant};
      --theme-onSurfaceVariant: ${theme.onSurfaceVariant};
      --theme-outline: ${theme.outline};
      --theme-rippleColor: ${theme.rippleColor};
      --chapterCtn-height: ${layoutHeight - 140};
    }
    @font-face {
      font-family: ${readerSettings.fontFamily};
      src: url("file:///android_asset/fonts/${readerSettings.fontFamily}.ttf");
    }
    </style>
    <link rel="stylesheet" href="${assetsUriPrefix}/css/index.css">
    <style>
    ${readerSettings.customCSS}
  </style>
  `;

  const readerBackgroundColor = readerSettings.theme;

  return (
    <>
      <Appbar
        mode="small"
        title={getString('readerSettings.title')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />

      <View style={{ height: READER_HEIGHT }}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          allowFileAccess={true}
          scalesPageToFit={true}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          style={{ backgroundColor: readerBackgroundColor }}
          nestedScrollEnabled={true}
          onMessage={ev => {
            const event: WebViewPostEvent = JSON.parse(ev.nativeEvent.data);
            switch (event.type) {
              case 'hide':
                if (hidden) {
                  webViewRef.current?.injectJavaScript('toolWrapper.show()');
                } else {
                  webViewRef.current?.injectJavaScript('toolWrapper.hide()');
                }
                setHidden(!hidden);
                break;
              case 'speak':
                if (event.data && typeof event.data === 'string') {
                  Speech.speak(event.data, {
                    onDone() {
                      webViewRef.current?.injectJavaScript('tts.next?.()');
                    },
                    voice: readerSettings.tts?.voice?.identifier,
                    pitch: readerSettings.tts?.pitch || 1,
                    rate: readerSettings.tts?.rate || 1,
                  });
                } else {
                  webViewRef.current?.injectJavaScript('tts.next?.()');
                }
                break;
              case 'stop-speak':
                Speech.stop();
                break;
              case 'copy':
                if (event.data && typeof event.data === 'string') {
                  Clipboard.setStringAsync(event.data).then(() => {
                    showToast(
                      getString('common.copiedToClipboard', { name: '' }),
                    );
                  });
                }
                break;
            }
          }}
          source={{
            html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                ${webViewCSS}
                <script async>
                  var initSettings = {
                    showScrollPercentage: ${showScrollPercentage},
                    swipeGestures: false,
                    showBatteryAndTime: ${showBatteryAndTime},
                    verticalSeekbar: ${verticalSeekbar},
                    bionicReading: ${bionicReading},
                  }
                  var batteryLevel = ${batteryLevel};
                  var autoSaveInterval = 2222;
                </script>
              </head>
              <body>
                <chapter 
                  data-novel-id='${dummyChapterInfo.novelId}'
                  data-chapter-id='${dummyChapterInfo.chapterId}'
                  onclick="reader.post({type:'hide'})"
                >
                  ${dummyHTML}
                </chapter>
                <div class="hidden" id="ToolWrapper">
                    <div id="TTS-Controller"></div>
                    <div id="ScrollBar"></div>
                </div>
                <div id="Image-Modal">
                  <img id="Image-Modal-img">
                </div>
                <div id="reader-footer-wrapper">
                    <div id="reader-footer">
                        <div id="reader-battery" class="reader-footer-item"></div>
                        <div id="reader-percentage" class="reader-footer-item"></div>
                        <div id="reader-time" class="reader-footer-item"></div>
                    </div>
                </div>
                </body>
                <script src="${assetsUriPrefix}/js/text-vibe.js"></script>
                <script src="${assetsUriPrefix}/js/index.js"></script>
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
          <List.Divider theme={theme} />
          <TextToSpeechSettings />
        </View>
      </ScrollView>
    </>
  );
};

export default SettingsReaderScreen;
