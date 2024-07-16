import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  NativeEventEmitter,
  NativeModules,
  StatusBar,
} from 'react-native';
import WebView from 'react-native-webview';
import color from 'color';

import { useTheme } from '@hooks/persisted';
import { ChapterInfo } from '@database/types';
import { getString } from '@strings/translations';

import { getPlugin } from '@plugins/pluginManager';
import { MMKVStorage, getMMKVObject } from '@utils/mmkv/mmkv';
import {
  CHAPTER_GENERAL_SETTINGS,
  CHAPTER_READER_SETTINGS,
  ChapterGeneralSettings,
  ChapterReaderSettings,
  initialChapterGeneralSettings,
  initialChapterReaderSettings,
} from '@hooks/persisted/useSettings';
import { getBatteryLevelSync } from 'react-native-device-info';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { showToast } from '@utils/showToast';
import { PLUGIN_STORAGE } from '@utils/Storages';
import { useChapterContext } from '../ChapterContext';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string | number };
};

type WebViewReaderProps = {
  html: string;
  nextChapter: ChapterInfo;
  webViewRef: React.RefObject<WebView>;
  saveProgress(percentage: number): void;
  onPress(): void;
  navigateToChapterBySwipe(name: string): void;
  pageReader: boolean;
};

const onLogMessage = (payload: { nativeEvent: { data: string } }) => {
  let dataPayload;
  try {
    dataPayload = JSON.parse(payload.nativeEvent.data);
  } catch (e) {}
  if (dataPayload) {
    if (dataPayload.type === 'console') {
      console.info(`[Console] ${JSON.stringify(dataPayload.msg, null, 2)}`);
    }
  }
};

const WebViewReader: React.FC<WebViewReaderProps> = props => {
  const {
    html,
    nextChapter,
    webViewRef,
    pageReader,
    saveProgress,
    onPress,
    navigateToChapterBySwipe,
  } = props;
  const { novel, chapter } = useChapterContext();
  const assetsUriPrefix = useMemo(
    () => (__DEV__ ? 'http://localhost:8081/assets' : 'file:///android_asset'),
    [],
  );
  const { RNDeviceInfo } = NativeModules;
  const deviceInfoEmitter = new NativeEventEmitter(RNDeviceInfo);
  const theme = useTheme();
  const readerSettings = useMemo(
    () =>
      getMMKVObject<ChapterReaderSettings>(CHAPTER_READER_SETTINGS) ||
      initialChapterReaderSettings,
    [],
  );
  const {
    showScrollPercentage,
    swipeGestures,
    showBatteryAndTime,
    verticalSeekbar,
    bionicReading,
  } = useMemo(
    () =>
      getMMKVObject<ChapterGeneralSettings>(CHAPTER_GENERAL_SETTINGS) ||
      initialChapterGeneralSettings,
    [],
  );
  const batteryLevel = useMemo(getBatteryLevelSync, []);
  const layoutHeight = Dimensions.get('window').height;
  const plugin = getPlugin(novel?.pluginId);
  const pluginCustomJS = `file://${PLUGIN_STORAGE}/${plugin?.id}/custom.js`;
  const pluginCustomCSS = `file://${PLUGIN_STORAGE}/${plugin?.id}/custom.css`;

  useEffect(() => {
    const mmkvListener = MMKVStorage.addOnValueChangedListener(key => {
      switch (key) {
        case CHAPTER_READER_SETTINGS:
          webViewRef.current?.injectJavaScript(
            `reader.updateReaderSettings(${MMKVStorage.getString(
              CHAPTER_READER_SETTINGS,
            )})`,
          );
          break;
        case CHAPTER_GENERAL_SETTINGS:
          webViewRef.current?.injectJavaScript(
            `reader.updateGeneralSettings(${MMKVStorage.getString(
              CHAPTER_GENERAL_SETTINGS,
            )})`,
          );
          break;
      }
    });

    const subscription = deviceInfoEmitter.addListener(
      'RNDeviceInfo_batteryLevelDidChange',
      (level: number) => {
        webViewRef.current?.injectJavaScript(
          `reader.updateBatteryLevel(${level})`,
        );
      },
    );

    return () => {
      subscription.remove();
      mmkvListener.remove();
    };
  }, []);
  const debugging = `
     // Debug
     console = new Object();
     console.log = function(log) {
      reader.post({"type": "console", "msg": log});
     };
     console.debug = console.log;
     console.info = console.log;
     console.warn = console.log;
     console.error = console.log;
     `;

  return (
    <WebView
      injectedJavaScript={debugging}
      ref={webViewRef}
      style={{ backgroundColor: readerSettings.theme }}
      allowFileAccess={true}
      originWhitelist={['*']}
      scalesPageToFit={true}
      showsVerticalScrollIndicator={false}
      javaScriptEnabled={true}
      onMessage={(ev: { nativeEvent: { data: string } }) => {
        __DEV__ && onLogMessage(ev);
        const event: WebViewPostEvent = JSON.parse(ev.nativeEvent.data);
        switch (event.type) {
          case 'hide':
            onPress();
            break;
          case 'next':
            navigateToChapterBySwipe('SWIPE_LEFT');
            break;
          case 'prev':
            navigateToChapterBySwipe('SWIPE_RIGHT');
            break;
          case 'save':
            if (event.data && typeof event.data === 'number') {
              saveProgress(event.data);
            }
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
                showToast(getString('common.copiedToClipboard', { name: '' }));
              });
            }
            break;
        }
      }}
      source={{
        baseUrl: plugin?.site,
        headers: plugin?.imageRequestInit?.headers,
        method: plugin?.imageRequestInit?.method,
        body: plugin?.imageRequestInit?.body,
        html: `
        <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                    <link rel="stylesheet" href="${assetsUriPrefix}/css/index.css">
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
                      --theme-surface-0-9: ${color(theme.surface)
                        .alpha(0.9)
                        .toString()};
                      --theme-onSurface: ${theme.onSurface};
                      --theme-surfaceVariant: ${theme.surfaceVariant};
                      --theme-onSurfaceVariant: ${theme.onSurfaceVariant};
                      --theme-outline: ${theme.outline};
                      --theme-rippleColor: ${theme.rippleColor};
                      --chapterCtn-height: ${layoutHeight - 140};
                      }
                      
                      @font-face {
                        font-family: ${readerSettings.fontFamily};
                        src: url("file:///android_asset/fonts/${
                          readerSettings.fontFamily
                        }.ttf");
                      }
                      </style>
                      ${
                        pageReader
                          ? `
                          <link rel="stylesheet" href="${assetsUriPrefix}/css/horizontal.css">
                        `
                          : ''
                      }
                    <link rel="stylesheet" href="${pluginCustomCSS}">
                    <style>${readerSettings.customCSS}</style>
                    <script>
                      var initSettings = {
                        showScrollPercentage: ${showScrollPercentage},
                        swipeGestures: ${swipeGestures},
                        showBatteryAndTime: ${showBatteryAndTime},
                        verticalSeekbar: ${verticalSeekbar},
                        bionicReading: ${bionicReading},
                      }
                      var batteryLevel = ${batteryLevel};
                      var autoSaveInterval = 2222;
                      var { NOVEL, CHAPTER } = ${JSON.stringify({
                        NOVEL: novel,
                        CHAPTER: chapter,
                      })}
                    </script>
                  </head>
                  <body>
                    <div class="chapterCtn"> 
                      <chapter 
                        data-page-reader='${pageReader}'
                        data-plugin-id='${novel.pluginId}'
                        data-novel-id='${chapter.novelId}'
                        data-chapter-id='${chapter.id}'
                      >
                      ${html}
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
                    </div>
                    ${
                      !pageReader
                        ? `
                    <div class="infoText">
                      ${getString(
                        'readerScreen.finished',
                      )}: ${chapter.name.trim()}
                    </div>
                    ${
                      nextChapter
                        ? `<button class="nextButton" onclick="reader.post({type:'next'})">
                            ${getString('readerScreen.nextChapter', {
                              name: nextChapter.name,
                            })}
                          </button>`
                        : `<div class="infoText">
                          ${getString('readerScreen.noNextChapter')}
                        </div>`
                    }`
                        : ''
                    }
                    </body>
                    <script>
                        // Debug
                        console = new Object();
                        console.log = function(log) {
                         reader.post({"type": "console", "msg": log});
                        };
                        console.debug = console.log;
                        console.info = console.log;
                        console.warn = console.log;
                        console.error = console.log;
                    </script>
                    <script src="${assetsUriPrefix}/js/text-vibe.js"></script>
                    <script src="${assetsUriPrefix}/js/default.js"></script>
                    <script src="${assetsUriPrefix}/js/horizontalScroll.js"></script>
                    <script src="${assetsUriPrefix}/js/index.js"></script>
                    <script src="${assetsUriPrefix}/js/setup.js"></script>
                    <script src="${assetsUriPrefix}/js/horizontalScroll.js"></script>
                    <script src="${pluginCustomJS}"></script>
                    <script>
                        setup(${chapter.progress},${readerSettings.customJS})
                    </script>
                </html>
                `,
      }}
    />
  );
};

export default WebViewReader;
