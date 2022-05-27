import React, { useRef, useEffect } from 'react';
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
  layoutHeight,
  webViewScroll,
}) => {
  const backgroundColor = readerBackground(reader.theme);

  const chapterText = sanitizeChapterText(html);

  const webViewRef = useRef(null);

  useEffect(() => {
    if (webViewRef.current && webViewScroll > 0) {
      webViewRef.current.injectJavaScript(`scroll=()=>{
        const p = ${webViewScroll};
        const h = document.body.scrollHeight;
        const s = (h*p)/100;
        const lh = ${Math.trunc(layoutHeight)};
        const xs = s - 1.3*lh;
        window.scrollTo({top: xs, left:0, behavior:"smooth"});
      };scroll()`);
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
