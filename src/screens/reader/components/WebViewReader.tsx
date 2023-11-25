import { FC } from 'react';
import { Dimensions, StatusBar } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import color from 'color';

import { useTheme } from '@hooks/useTheme';
import { ChapterInfo } from '@database/types';
import { useReaderSettings, useSettingsV1 } from '@redux/hooks';
import { getString } from '@strings/translations';

import { getPlugin } from '@plugins/pluginManager';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string | number };
};

type WebViewReaderProps = {
  data: {
    novel: {
      pluginId: string;
    };
    chapter: ChapterInfo;
  };
  html: string;
  swipeGestures: boolean;
  nextChapter: ChapterInfo;
  webViewRef: React.RefObject<WebView>;
  saveProgress(offsetY: number, percentage: number): Promise<void>;
  onPress(): void;
  onLayout(): void;
  navigateToChapterBySwipe(name: string): void;
  onWebViewNavigationStateChange({ url }: WebViewNavigation): void;
};

const WebViewReader: FC<WebViewReaderProps> = props => {
  const {
    data,
    html,
    swipeGestures,
    nextChapter,
    webViewRef,
    saveProgress,
    onPress,
    onLayout,
    navigateToChapterBySwipe,
    onWebViewNavigationStateChange,
  } = props;

  const theme = useTheme();
  const { novel, chapter } = data;
  const readerSettings = useReaderSettings();
  const { showScrollPercentage } = useSettingsV1();

  const layoutHeight = Dimensions.get('window').height;
  const plugin = getPlugin(novel?.pluginId);
  return (
    <WebView
      ref={webViewRef}
      style={{ backgroundColor: readerSettings.theme }}
      allowFileAccess={true}
      originWhitelist={['*']}
      scalesPageToFit={true}
      showsVerticalScrollIndicator={false}
      onNavigationStateChange={onWebViewNavigationStateChange}
      nestedScrollEnabled={true}
      javaScriptEnabled={true}
      onLayout={async () => onLayout()}
      onMessage={ev => {
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
          case 'error-img':
            if (event.data && typeof event.data === 'string') {
              plugin?.fetchImage(event.data).then(base64 => {
                webViewRef.current?.injectJavaScript(
                  `document.querySelector("img[error-src='${event.data}']").src="data:image/jpg;base64,${base64}"`,
                );
              });
            }
            break;
          case 'save':
            if (
              event.data &&
              event.data.offsetY &&
              event.data.percentage &&
              typeof event.data.offsetY === 'number' &&
              typeof event.data.percentage === 'number'
            ) {
              saveProgress(event.data.offsetY, event.data.percentage);
            }
            break;
        }
      }}
      source={{
        html: `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
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
                      --theme-onSecondary: ${theme.onSecondary};
                      --theme-surface: ${theme.surface};
                      --theme-surface-0-9: ${color(theme.surface)
                        .alpha(0.9)
                        .toString()};
                      --theme-onSurface:${theme.onSurface};
                      --theme-outline: ${theme.outline};
                      --chapterCtn-height: ${layoutHeight - 140};
                      }
                      @font-face {
                        font-family: ${readerSettings.fontFamily};
                        src: url("file:///android_asset/fonts/${
                          readerSettings.fontFamily
                        }.ttf");
                      }
                    </style>
                    <link rel="stylesheet" href="file:///android_asset/css/index.css">
                    <style>${readerSettings.customCSS}</style>
                  </head>
                  <body>
                    <div class="chapterCtn" onclick="reader.post({type:'hide'})">
                      <chapter 
                        data-plugin-id='${novel.pluginId}'
                        data-novel-id='${chapter.novelId}'
                        data-chapter-id='${chapter.id}'
                      >
                        ${html}
                      </chapter>
                      <div class="d-none" id="ScrollBar"></div>
                      <div id="reader-percentage"></div>
                    </div>
                    <div class="infoText">
                      ${getString(
                        'readerScreen.finished',
                      )}: ${chapter.name.trim()}
                    </div>
                    ${
                      nextChapter
                        ? `<button class="nextButton" onclick="reader.post({type:'next'})">
                            Next: ${nextChapter.name}
                          </button>`
                        : `<div class="infoText">
                          ${getString('readerScreen.noNextChapter')}
                        </div>`
                    }
                    </body>
                    <script>
                      var showScrollPercentage = ${showScrollPercentage};
                      var swipeGestures = ${swipeGestures};
                      var autoSaveInterval = 2222;
                    </script>
                    <script src="file:///android_asset/js/index.js"></script>
                    <script>
                      async function fn(){${readerSettings.customJS}}
                      document.addEventListener("DOMContentLoaded", fn);
                    </script>
                  </body>
                </html>
                `,
      }}
    />
  );
};

export default WebViewReader;
