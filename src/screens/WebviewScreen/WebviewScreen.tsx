import React, { useRef, useState } from 'react';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { ProgressBar } from 'react-native-paper';

import { useBackHandler } from '@hooks';
import { useTheme } from '@hooks/persisted';
import { WebviewScreenProps } from '@navigators/types';
import { getUserAgent } from '@hooks/persisted/useUserAgent';
import { resolveUrl } from '@services/plugin/fetch';
import { storageRaw } from '@plugins/helpers/storage';
import Appbar from './components/Appbar';

type StorageData = {
  localStorage?: Record<string, any>;
  sessionStorage?: Record<string, any>;
};

const WebviewScreen = ({ route, navigation }: WebviewScreenProps) => {
  const { name, url, pluginId, isNovel } = route.params;
  const uri = resolveUrl(pluginId, url, isNovel);

  const theme = useTheme();
  const webViewRef = useRef<WebView | null>(null);

  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState(name || '');
  const [currentUrl, setCurrentUrl] = useState(uri);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [tempData, setTempData] = useState<StorageData>();

  const handleNavigation = (e: WebViewNavigation) => {
    setCurrentUrl(e.url);
    setCanGoBack(e.canGoBack);
    setCanGoForward(e.canGoForward);
  };

  const saveData = () => {
    if (pluginId && tempData) {
      if (tempData?.localStorage) {
        storageRaw.setString(
          `${pluginId}_LocalStorage`,
          JSON.stringify(tempData.localStorage),
        );
      }
      if (tempData?.sessionStorage) {
        storageRaw.setString(
          `${pluginId}_SessionStorage`,
          JSON.stringify(tempData.sessionStorage),
        );
      }
    }
  };

  useBackHandler(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true;
    }
    saveData();
    return false;
  });

  const injectJavaScriptCode =
    'window.ReactNativeWebView.postMessage(JSON.stringify({localStorage,sessionStorage}))';

  return (
    <>
      <Appbar
        title={title}
        theme={theme}
        currentUrl={currentUrl}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        webView={webViewRef}
        goBack={() => {
          saveData();
          navigation.goBack();
        }}
      />
      <ProgressBar
        color={theme.primary}
        progress={progress}
        visible={progress !== 1}
      />
      <WebView
        userAgent={getUserAgent()}
        ref={webViewRef}
        source={{ uri }}
        onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
        onLoadEnd={({ nativeEvent }) => setTitle(nativeEvent.title)}
        onNavigationStateChange={handleNavigation}
        injectedJavaScript={injectJavaScriptCode}
        onMessage={({ nativeEvent }) =>
          setTempData(JSON.parse(nativeEvent.data))
        }
      />
    </>
  );
};

export default WebviewScreen;
