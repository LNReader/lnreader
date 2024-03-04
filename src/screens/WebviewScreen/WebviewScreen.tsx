import React, { useRef, useState } from 'react';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { ProgressBar } from 'react-native-paper';

import { useBackHandler } from '@hooks';
import { useTheme } from '@hooks/persisted';
import { WebviewScreenProps } from '@navigators/types';
import { getUserAgent } from '@hooks/persisted/useUserAgent';
import { resolveUrl } from '@services/plugin/fetch';
import { storage } from '@plugins/helpers/storage';
import Appbar from './components/Appbar';
import Menu from './components/Menu';

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
  const [menuVisible, setMenuVisible] = useState(false);

  const handleNavigation = (e: WebViewNavigation) => {
    if (!e.loading) {
      setTitle(e.title);
    }
    setCurrentUrl(e.url);
    setCanGoBack(e.canGoBack);
    setCanGoForward(e.canGoForward);
  };

  const saveData = () => {
    if (pluginId && tempData) {
      storage.mmkv.set(
        pluginId + '_LocalStorage',
        JSON.stringify(tempData?.localStorage || {}),
      );
      storage.mmkv.set(
        pluginId + '_SessionStorage',
        JSON.stringify(tempData?.sessionStorage || {}),
      );
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
    'window.ReactNativeWebView.postMessage(JSON.stringify({localStorage, sessionStorage}))';

  return (
    <>
      <Menu
        theme={theme}
        currentUrl={currentUrl}
        webView={webViewRef}
        visible={menuVisible}
        setMenuVisible={setMenuVisible}
      />
      <Appbar
        title={title}
        theme={theme}
        currentUrl={currentUrl}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        webView={webViewRef}
        setMenuVisible={setMenuVisible}
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
        onNavigationStateChange={handleNavigation}
        injectedJavaScript={injectJavaScriptCode}
        setDisplayZoomControls={true}
        onMessage={({ nativeEvent }) =>
          setTempData(JSON.parse(nativeEvent.data))
        }
      />
    </>
  );
};

export default WebviewScreen;
