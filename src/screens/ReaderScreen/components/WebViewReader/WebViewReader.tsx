import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';

import WebView from 'react-native-webview';
import {useReaderSettings, useTheme} from '../../../../redux/hooks';

interface WebViewReaderProps {
  html: string;
  onScroll: ({nativeEvent}: {nativeEvent: any}) => void;
  onWebViewNavigationStateChange?: () => void;
}

const WebViewReader: React.FC<WebViewReaderProps> = ({
  html,
  onScroll,
  onWebViewNavigationStateChange,
}) => {
  const theme = useTheme();
  const ReaderSettings = useReaderSettings();

  return (
    <View style={styles.container}>
      <WebView
        style={{backgroundColor: ReaderSettings.backgroundColor}}
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
                      padding: 0 ${ReaderSettings.paddingHorizontal}% 80px ${ReaderSettings.paddingHorizontal}%;                      
                      font-size: ${ReaderSettings.fontSize}px;
                      color: ${ReaderSettings.textColor};
                      text-align: ${ReaderSettings.textAlign};
                      line-height: ${ReaderSettings.lineHeight};
                      font-family: ${ReaderSettings.fontFamily};
                    }
                    hr {
                      margin-top: 20px;
                      margin-bottom: 20px;
                    }
                    a {
                      color: ${theme.primary};
                    }
                    img {
                      display: block;
                      width: auto;
                      height: auto;
                      max-width: 100%;
                    }
                  </style>
                  <style>
                    ${ReaderSettings.customCSS}
                    @font-face {
                      font-family: ${ReaderSettings.fontFamily};
                      src: url("file:///android_asset/fonts/${ReaderSettings.fontFamily}.ttf");
                    }
                  </style>
                </head>
                <body>
                  ${html}
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
