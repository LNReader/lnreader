import React, { memo, useEffect, useMemo, useRef } from 'react';
import { NativeEventEmitter, NativeModules, StatusBar } from 'react-native';
import WebView from 'react-native-webview';
import color from 'color';
import { useTheme } from '@providers/Providers';
import { getString } from '@strings/translations';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import {
  CHAPTER_GENERAL_SETTINGS,
  CHAPTER_READER_SETTINGS,
} from '@hooks/persisted/useSettings';

import { getBatteryLevelSync } from 'react-native-device-info';
import * as Speech from 'expo-speech';
import { dummyHTML } from './utils';
import { useSettingsContext } from '@components/Context/SettingsContext';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string | number };
};

const onLogMessage = (payload: { nativeEvent: { data: string } }) => {
  const dataPayload = JSON.parse(payload.nativeEvent.data);
  if (dataPayload) {
    if (dataPayload.type === 'console') {
      /* eslint-disable no-console */
      console.info(`[Console] ${JSON.stringify(dataPayload.msg, null, 2)}`);
    }
  }
};

const { RNDeviceInfo } = NativeModules;
const deviceInfoEmitter = new NativeEventEmitter(RNDeviceInfo);

const assetsUriPrefix = __DEV__
  ? 'http://localhost:8081/assets'
  : 'file:///android_asset';

const novel = {
  'artist': null,
  'author': 'Kinugasa Shougo',
  'cover':
    'file:///storage/emulated/0/Android/data/com.rajarsheechatterjee.LNReader/files/Novels/lightnovelcave/16/cover.png?1717862123181',
  'genres': 'Drama,Slice of Life,Psychological,School Life,Shounen',
  'id': 16,
  'inLibrary': 1,
  'isLocal': 0,
  'name': 'Classroom of the Elite (LN)',
  'path': 'novel/classroom-of-the-elite-16091321',
  'pluginId': 'lightnovelcave',
  'status': 'Ongoing',
  'summary':
    'Kōdo Ikusei Senior High School, a leading prestigious school with state-of-the-art facilities where nearly 100% of students go on to university or find employment. The students there have the freedom to wear any hairstyle and bring any personal effects they desire. Kōdo Ikusei is a paradise-like school, but the truth is that only the most superior of students receive favorable treatment.The protagonist Kiyotaka Ayanokōji is a student of D-class, which is where the school dumps its “inferior” students in order to ridicule them. For a certain reason, Kiyotaka was careless on his entrance examination, and was put in D-class. After meeting Suzune Horikita and Kikyō Kushida, two other students in his class, Kiyotaka’s situation begins to change.Show More',
  'totalPages': 8,
};
const chapter = {
  'bookmark': 0,
  'chapterNumber': 2.1,
  'id': 3722,
  'isDownloaded': 1,
  'name': 'Chapter V4C2.1 - A Vast Array of Thoughts Part 1',
  'novelId': 16,
  'page': '2',
  'path': 'novel/classroom-of-the-elite-547/vol-4-chapter-2-1',
  'position': 0,
  'progress': 0,
  'readTime': '2024-06-08 22:56:09',
  'releaseTime': '14 tháng 9 năm 2021',
  'unread': 1,
  'updatedTime': null,
};

const SettingsWebView = () => {
  const webViewRef = useRef<WebView>(null);
  const theme = useTheme();
  const settings = useSettingsContext();
  const batteryLevel = useMemo(() => getBatteryLevelSync(), []);

  useEffect(() => {
    const mmkvListener = MMKVStorage.addOnValueChangedListener(key => {
      switch (key) {
        case CHAPTER_READER_SETTINGS:
          webViewRef.current?.injectJavaScript(
            `reader.settings.val = ${MMKVStorage.getString(
              CHAPTER_READER_SETTINGS,
            )}`,
          );
          break;
        case CHAPTER_GENERAL_SETTINGS:
          webViewRef.current?.injectJavaScript(
            `reader.generalSettings.val = ${MMKVStorage.getString(
              CHAPTER_GENERAL_SETTINGS,
            )}`,
          );
          break;
      }
    });

    const subscription = deviceInfoEmitter.addListener(
      'RNDeviceInfo_batteryLevelDidChange',
      (level: number) => {
        webViewRef.current?.injectJavaScript(
          `reader.batteryLevel.val = ${level}`,
        );
      },
    );
    return () => {
      subscription.remove();
      mmkvListener.remove();
    };
  }, [webViewRef]);

  const customJS = useMemo(() => {
    return settings.codeSnippetsJS
      .map(snippet => {
        if (!snippet.active) return null;
        return `
      try {
        ${snippet.code}
      } catch (error) {
        alert('Error loading executing ${snippet.name}:\n' + error);
      }
      `;
      })
      .filter(Boolean)
      .join('\n');
  }, [settings.codeSnippetsJS]);

  const customCSS = useMemo(() => {
    return settings.codeSnippetsCSS
      .map(snippet => {
        if (!snippet.active) return null;
        return snippet.code;
      })
      .filter(Boolean)
      .join('\n');
  }, [settings.codeSnippetsCSS]);

  const preparedDummyHTML = useMemo(() => {
    let resultHtml = dummyHTML;
    settings.removeText.forEach(text => {
      resultHtml = resultHtml.replace(text, '');
    });
    Object.entries(settings.replaceText).forEach(([text, replacement]) => {
      resultHtml = resultHtml.replace(text, replacement);
    });
    return resultHtml;
  }, [settings.removeText, settings.replaceText]);

  const webViewCSS = useMemo(
    () => `
  <style>
    :root {
      --StatusBar-currentHeight: ${StatusBar.currentHeight};
      --readerSettings-theme: ${settings.backgroundColor};
      --readerSettings-padding: ${settings.padding}px;
      --readerSettings-textSize: ${settings.textSize}px;
      --readerSettings-textColor: ${settings.textColor};
      --readerSettings-textAlign: ${settings.textAlign};
      --readerSettings-lineHeight: ${settings.lineHeight};
      --readerSettings-fontFamily: ${settings.fontFamily};
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
    }
    @font-face {
      font-family: ${settings.fontFamily};
      src: url("file:///android_asset/fonts/${settings.fontFamily}.ttf");
    }
    </style>
    <link rel="stylesheet" href="${assetsUriPrefix}/css/index.css">
    <link rel="stylesheet" href="${assetsUriPrefix}/css/pageReader.css">
    <link rel="stylesheet" href="${assetsUriPrefix}/css/toolWrapper.css">
    <link rel="stylesheet" href="${assetsUriPrefix}/css/tts.css">
    <style>
    ${customCSS}
  </style>
  `,
    [
      settings.backgroundColor,
      customCSS,
      settings.fontFamily,
      settings.lineHeight,
      settings.padding,
      settings.textAlign,
      settings.textColor,
      settings.textSize,
      theme.onPrimary,
      theme.onSecondary,
      theme.onSurface,
      theme.onSurfaceVariant,
      theme.onTertiary,
      theme.outline,
      theme.primary,
      theme.rippleColor,
      theme.secondary,
      theme.surface,
      theme.surfaceVariant,
      theme.tertiary,
    ],
  );

  const webViewSource = useMemo(
    () => ({
      html: `
            <html >
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                ${webViewCSS}
                <script async>
                  var initSettings = {
                    showScrollPercentage: ${settings.showScrollPercentage},
                    swipeGestures: false,
                    showBatteryAndTime: ${settings.showBatteryAndTime},
                    verticalSeekbar: ${settings.verticalSeekbar},
                    bionicReading: ${settings.bionicReading},
                  }
                  var batteryLevel = ${batteryLevel};
                  var autoSaveInterval = 2222;
                  var { NOVEL, CHAPTER } = ${JSON.stringify({
                    NOVEL: novel,
                    CHAPTER: chapter,
                  })}
                </script>
              </head>
              <body class="${settings.pageReader ? 'page-reader' : ''}">
                            <div class="transition-chapter" style="transform: translateX(0%);
                            ${settings.pageReader ? '' : 'display: none'}"
                            >${chapter.name}</div>
                            <div id="LNReader-chapter">
                              ${preparedDummyHTML}
                            </div>
                            <div id="reader-ui"></div>
                            </body>
                            <script>
                              var initialPageReaderConfig = ${JSON.stringify({
                                nextChapterScreenVisible: false,
                              })};


                              var initialReaderConfig = ${JSON.stringify({
                                readerSettings: settings,
                                chapterGeneralSettings: settings,
                                novel,
                                chapter,
                                nextChapter: undefined,
                                prevChapter: undefined,
                                batteryLevel,
                                autoSaveInterval: 2222,
                                DEBUG: __DEV__,
                                strings: {
                                  finished: `${getString(
                                    'readerScreen.finished',
                                  )}: ${chapter.name.trim()}`,
                                  nextChapter: getString(
                                    'readerScreen.nextChapter',
                                    {
                                      name: undefined,
                                    },
                                  ),
                                  noNextChapter: getString(
                                    'readerScreen.noNextChapter',
                                  ),
                                },
                              })}
                            </script>
                            <script src="${assetsUriPrefix}/js/icons.js"></script>
                            <script src="${assetsUriPrefix}/js/van.js"></script>
                            <script src="${assetsUriPrefix}/js/text-vibe.js"></script>
                            <script src="${assetsUriPrefix}/js/core.js"></script>
                            <script src="${assetsUriPrefix}/js/index.js"></script>
                            <script>
                            ${customJS}
                              async function fn(){
                                  let novelName = "${novel.name}";
                                  let chapterName = "${chapter.name}";
                                  let sourceId = "${novel.pluginId}";
                                  let chapterId =${chapter.id};
                                  let novelId =${chapter.novelId};
                                  let html = document.getElementById("LNReader-chapter").innerHTML;
                                }
                                document.addEventListener("DOMContentLoaded", fn);
                            </script>
            </html>
            `,
    }),
    [batteryLevel, settings, webViewCSS, customJS, preparedDummyHTML],
  );

  return (
    <WebView
      ref={webViewRef}
      style={{ backgroundColor: settings.backgroundColor }}
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
            break;
          case 'next':
            break;
          case 'prev':
            break;
          case 'save':
            break;
          case 'speak':
            if (event.data && typeof event.data === 'string') {
              Speech.speak(event.data, {
                onDone() {
                  webViewRef.current?.injectJavaScript('tts.next?.()');
                },
                voice: settings.tts?.voice?.identifier,
                pitch: settings.tts?.pitch || 1,
                rate: settings.tts?.rate || 1,
              });
            } else {
              webViewRef.current?.injectJavaScript('tts.next?.()');
            }
            break;
          case 'stop-speak':
            Speech.stop();
            break;
        }
      }}
      source={webViewSource}
    />
  );
};

export default memo(SettingsWebView);
