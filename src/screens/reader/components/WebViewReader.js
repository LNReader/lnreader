import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import WebView from 'react-native-webview';

import { readerBackground } from '../utils/readerStyles';
import { sanitizeChapterText } from '../utils/sanitizeChapterText';

const WebViewReader = ({
  html,
  theme,
  reader,
  onScroll,
  onWebViewNavigationStateChange,
}) => {
  const backgroundColor = readerBackground(reader.theme);

  const chapterText = sanitizeChapterText(html);

  return (
    <View style={styles.container}>
      <WebView
        style={{ backgroundColor }}
        originWhitelist={['*']}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onNavigationStateChange={onWebViewNavigationStateChange}
        nestedScrollEnabled={true}
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
                    </style>
                    
                    <style>
                      ${reader.customCSS}
                      
                      @font-face {
                        font-family: ${reader.fontFamily};
                        src: url("file:///android_asset/fonts/${reader.fontFamily}.ttf");
                      }
                    </style>
                  </head>
                  <body>
                    ${chapterText}
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
