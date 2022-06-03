import { getString } from '@strings/translations';
import React, { useRef, useEffect, FunctionComponent } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import WebView from 'react-native-webview';
import { ChapterItem } from 'src/database/types';
import { ThemeType } from 'src/theme/types';

import { readerBackground } from '../utils/readerStyles';
import { sanitizeChapterText } from '../utils/sanitizeChapterText';

type WebViewReaderProps = {
  html: string;
  theme: ThemeType;
  reader: {
    theme: string;
    textColor: string;
    textSize: number;
    textAlign: string;
    padding: number;
    fontFamily: string;
    lineHeight: number;
    customCSS: string;
  };
  chapterName: string;
  nextChapter: ChapterItem;
  textSelectable: boolean;
  navigateToNextChapter: () => void;
  onPress(): void;
  onScroll(): void;
  onWebViewNavigationStateChange(): void;
  layoutHeight: number;
  webViewScroll: { percentage: number; type: 'smooth' | 'instant' };
  setScrollPercentage: React.Dispatch<React.SetStateAction<number>>;
  scrollPercentage: number;
};

const WebViewReader: FunctionComponent<WebViewReaderProps> = ({
  html,
  theme,
  reader,
  onScroll,
  onWebViewNavigationStateChange,
  layoutHeight,
  webViewScroll,
  nextChapter,
  chapterName,
  onPress,
  navigateToNextChapter,
  setScrollPercentage,
  scrollPercentage,
}) => {
  const backgroundColor = readerBackground(reader.theme);

  const chapterText = sanitizeChapterText(html);

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (webViewRef.current && webViewScroll.percentage !== scrollPercentage) {
      webViewRef.current.injectJavaScript(`(()=>{
        const p = ${webViewScroll.percentage};
        const h = document.body.scrollHeight;
        const s = (h*p)/100;
        const lh = ${Math.trunc(layoutHeight)};
        const xs = s - 1.2*lh;
        window.scrollTo({top: p === 100 ? h : xs, left:0, behavior:"${
          webViewScroll.type
        }"});
      })()`);
      setScrollPercentage(webViewScroll.percentage || 0);
    }
  }, [webViewScroll]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={{ backgroundColor }}
        originWhitelist={['*']}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onNavigationStateChange={onWebViewNavigationStateChange}
        nestedScrollEnabled={true}
        onMessage={ev => {
          const event = ev.nativeEvent.data;
          switch (event) {
            case 'hide':
              console.log(theme.colorAccent, theme.colorButtonText, theme);
              onPress?.();
              break;
            case 'next':
              navigateToNextChapter();
              break;
          }
        }}
        source={{
          html: `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                    <style>
                      html {
                        overflow-x: hidden;
                        padding-top: ${StatusBar.currentHeight};
                        word-wrap: break-word;
                      }
                      body {
                        padding-left: ${reader.padding}%;
                        padding-right: ${reader.padding}%;
                        padding-bottom: 30px;
                        
                        font-size: ${reader.textSize}px;
                        color: ${reader.textColor};
                        text-align: ${reader.textAlign};
                        line-height: ${reader.lineHeight};
                        font-family: ${reader.fontFamily};
                      }
                      hr {
                        margin-top: 20px;
                        margin-bottom: 20px;
                      }
                      a {
                        color: ${theme.colorAccent};
                      }
                      img {
                        display: block;
                        width: auto;
                        height: auto;
                        max-width: 100%;
                      }
                      .nextButton,
                      .infoText {
                        width: 100%;
                        min-height: 40;
                        border-radius: 50px;
                        padding-vertical: 8;
                        padding-horizontal: 24;
                        border-width: 1;
                        color: ${theme.colorButtonText};
                        background-color: ${theme.colorAccent};
                        font-size: 0.8em;
                      }
                      .infoText {
                        background-color: transparent;
                        text-align:center;
                        border: none;
                        margin: 0px;
                        color: inherit;
                      }
                    </style>
                    
                    <style>
                      ${reader.customCSS}
                      
                      @font-face {
                        font-family: ${reader.fontFamily};
                        src: url("file:///android_asset/fonts/${
                          reader.fontFamily
                        }.ttf");
                      }
                    </style>
                  </head>
                  <body>
                    <chapter onClick="window.ReactNativeWebView.postMessage('hide')">
                      ${chapterText}
                    </chapter>
                    <div class="infoText">
                    ${getString(
                      'readerScreen.finished',
                    )}: ${chapterName?.trim()}
                    </div>
                    ${
                      nextChapter
                        ? `<button class="nextButton" onClick="window.ReactNativeWebView.postMessage('next')">
                      Next: ${nextChapter.chapterName}
                    </button>`
                        : `<div class="infoText">${getString(
                            'readerScreen.noNextChapter',
                          )}</div>`
                    }
                  </body>
                </html>
                `,
        }}
      />
    </View>
  );
};

export default WebViewReader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
