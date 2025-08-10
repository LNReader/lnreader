import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { NativeEventEmitter, NativeModules, StatusBar } from 'react-native';
import WebView from 'react-native-webview';
import color from 'color';

import { useTheme } from '@providers/ThemeProvider';
import { getString } from '@strings/translations';
import KeyboardAvoidingModal from '@components/Modal/KeyboardAvoidingModal';
import { TextInput } from 'react-native-paper';

import { getPlugin } from '@plugins/pluginManager';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import {
  CHAPTER_GENERAL_SETTINGS,
  CHAPTER_READER_SETTINGS,
} from '@hooks/persisted/useSettings';

import { getBatteryLevelSync } from 'react-native-device-info';
import * as Speech from 'expo-speech';
import { PLUGIN_STORAGE } from '@utils/Storages';
import { useChapterContext } from '../ChapterContext';
import { useSettingsContext } from '@components/Context/SettingsContext';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string | number };
  action?: string;
  text?: string;
};

type WebViewReaderProps = {
  onPress(): void;
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

const WebViewReader: React.FC<WebViewReaderProps> = ({ onPress }) => {
  const {
    novel,
    chapter,
    chapterText,
    navigateChapter,
    saveProgress,
    nextChapter,
    prevChapter,
    webViewRef,
  } = useChapterContext();
  const theme = useTheme();
  const settings = useSettingsContext();

  const batteryLevel = useMemo(() => getBatteryLevelSync(), []);
  const plugin = getPlugin(novel?.pluginId);
  const pluginCustomJS = `file://${PLUGIN_STORAGE}/${plugin?.id}/custom.js`;
  const pluginCustomCSS = `file://${PLUGIN_STORAGE}/${plugin?.id}/custom.css`;
  const nextChapterScreenVisible = useRef<boolean>(false);

  // Replace modal state
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [selectedTextForReplace, setSelectedTextForReplace] = useState('');
  const [replacementText, setReplacementText] = useState('');

  const handleTextAction = React.useCallback(
    (action: string, text: string) => {
      if (!text) return;

      const { setSettings } = settings;
      if (action === 'remove') {
        // Add to removeText array if not already present
        const newRemoveText = [...settings.removeText];
        if (!newRemoveText.includes(text)) {
          newRemoveText.push(text);
          setSettings({ removeText: newRemoveText });
        }
      } else if (action === 'replace-prompt') {
        // Show modal for user to enter replacement text
        setSelectedTextForReplace(text);
        setReplacementText('');
        setReplaceModalVisible(true);
      }
    },
    [settings],
  );

  const handleReplaceSave = React.useCallback(() => {
    if (!selectedTextForReplace) return false;

    const { setSettings } = settings;
    const newReplaceText = { ...settings.replaceText };
    if (!(selectedTextForReplace in newReplaceText)) {
      newReplaceText[selectedTextForReplace] = replacementText;
      setSettings({ replaceText: newReplaceText });
    }
    setReplaceModalVisible(false);
    return true;
  }, [selectedTextForReplace, replacementText, settings]);

  const handleReplaceCancel = React.useCallback(() => {
    setReplaceModalVisible(false);
    setSelectedTextForReplace('');
    setReplacementText('');
  }, []);

  const html = useMemo(() => {
    let chText = chapterText;
    settings.removeText.forEach(text => {
      const m = text.match(/^\/(.*)\/([gmiyuvsd]*)$/);
      if (m) {
        const regex = new RegExp(m[1], m[2] ?? '');
        chText = chText.replace(regex, '');
      } else {
        chText = chText.split(text).join('');
      }
    });
    Object.entries(settings.replaceText).forEach(([text, replacement]) => {
      const m = text.match(/^\/(.*)\/([gmiyuvsd]*)$/);
      if (m) {
        const regex = new RegExp(m[1], m[2] ?? '');
        chText = chText.replace(regex, replacement);
      } else {
        chText = chText.split(text).join(replacement);
      }
    });
    return chText;
  }, [chapterText, settings.removeText, settings.replaceText]);

  if (chapterText === undefined) {
  }

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
        alert(\`Error loading executing ${snippet.name}:\n\` + error);
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

  const preparedHTML = useMemo(() => {
    let resultHtml = html;
    settings.removeText.forEach(text => {
      resultHtml = resultHtml.replace(text, '');
    });
    Object.entries(settings.replaceText).forEach(([text, replacement]) => {
      resultHtml = resultHtml.replace(text, replacement);
    });
    return resultHtml;
  }, [html]);

  return (
    <>
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
              onPress();
              break;
            case 'next':
              nextChapterScreenVisible.current = true;
              navigateChapter('NEXT');
              break;
            case 'prev':
              navigateChapter('PREV');
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
            case 'text-action':
              if (event.action && event.text) {
                handleTextAction(event.action as string, String(event.text));
              }
              break;
          }
        }}
        source={{
          baseUrl: !chapter.isDownloaded ? plugin?.site : undefined,
          headers: plugin?.imageRequestInit?.headers,
          method: plugin?.imageRequestInit?.method,
          body: plugin?.imageRequestInit?.body,
          html: `
        <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
              <link rel="stylesheet" href="${assetsUriPrefix}/css/index.css">
              <link rel="stylesheet" href="${assetsUriPrefix}/css/pageReader.css">
              <link rel="stylesheet" href="${assetsUriPrefix}/css/toolWrapper.css">
              <link rel="stylesheet" href="${assetsUriPrefix}/css/tts.css">
              <style>
              :root {
                --StatusBar-currentHeight: ${StatusBar.currentHeight}px;
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
                --theme-surface-0-9: ${color(theme.surface)
                  .alpha(0.9)
                  .toString()};
                --theme-onSurface: ${theme.onSurface};
                --theme-surfaceVariant: ${theme.surfaceVariant};
                --theme-onSurfaceVariant: ${theme.onSurfaceVariant};
                --theme-outline: ${theme.outline};
                --theme-rippleColor: ${theme.rippleColor};
                }

                @font-face {
                  font-family: ${settings.fontFamily};
                  src: url("file:///android_asset/fonts/${
                    settings.fontFamily
                  }.ttf");
                }
                </style>

              <link rel="stylesheet" href="${pluginCustomCSS}">
              <link rel="stylesheet" href="${assetsUriPrefix}/css/textRemover.css">
              <style>${customCSS}</style>
            </head>
            <body class="${settings.pageReader ? 'page-reader' : ''}">
              <div class="transition-chapter" style="transform: ${
                nextChapterScreenVisible.current
                  ? 'translateX(-100%)'
                  : 'translateX(0%)'
              };
              ${settings.pageReader ? '' : 'display: none'}"
              ">${chapter.name}</div>
              <div id="LNReader-chapter">
                ${preparedHTML}
              </div>
              <div id="reader-ui"></div>
              </body>
              <script>
              
                var initialPageReaderConfig = ${JSON.stringify({
                  nextChapterScreenVisible: nextChapterScreenVisible.current,
                })};


                var initialReaderConfig = ${JSON.stringify({
                  readerSettings: settings,
                  chapterGeneralSettings: settings,
                  novel,
                  chapter,
                  nextChapter,
                  prevChapter,
                  batteryLevel,
                  autoSaveInterval: 2222,
                  DEBUG: __DEV__,
                  strings: {
                    finished: `${getString(
                      'readerScreen.finished',
                    )}: ${chapter.name.trim()}`,
                    nextChapter: getString('readerScreen.nextChapter', {
                      name: nextChapter?.name,
                    }),
                    noNextChapter: getString('readerScreen.noNextChapter'),
                  },
                })}
              </script>
              <script src="${assetsUriPrefix}/js/icons.js"></script>
              <script src="${assetsUriPrefix}/js/van.js"></script>
              <script src="${assetsUriPrefix}/js/text-vibe.js"></script>
              <script src="${assetsUriPrefix}/js/core.js"></script>
              <script src="${assetsUriPrefix}/js/index.js"></script>
              <script src="${pluginCustomJS}"></script>
              <script src="${assetsUriPrefix}/js/textRemover.js"></script>
              <script>
                function fn(){
                    let novelName = "${novel.name}";
                    let chapterName = "${chapter.name}";
                    let sourceId = "${novel.pluginId}";
                    let chapterId =${chapter.id};
                    let novelId =${chapter.novelId};
                    let html = document.getElementById("LNReader-chapter").innerHTML;
                    ${customJS}
                  }
                  document.addEventListener("DOMContentLoaded", fn);
              </script>
          </html>
          `,
        }}
      />

      <KeyboardAvoidingModal
        visible={replaceModalVisible}
        onDismiss={() => setReplaceModalVisible(false)}
        onSave={handleReplaceSave}
        onCancel={handleReplaceCancel}
        title="Replace Text"
      >
        <TextInput
          label="Text to replace"
          value={selectedTextForReplace}
          editable={false}
          mode="outlined"
          style={{ marginBottom: 16 }}
          theme={{ colors: { background: theme.surface } }}
        />
        <TextInput
          label="Replace with"
          value={replacementText}
          onChangeText={setReplacementText}
          autoCorrect={false}
          mode="outlined"
          style={{ marginBottom: 16 }}
          theme={{ colors: { background: theme.surface } }}
        />
      </KeyboardAvoidingModal>
    </>
  );
};

export default memo(WebViewReader);
