import React from 'react';
import WebView, { WebViewNavigation } from 'react-native-webview';
//import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar, Appbar as PaperAppbar } from 'react-native-paper';

import { useTheme } from '@hooks/persisted';
import { WebviewScreenProps } from '@navigators/types';
import { getUserAgent } from '@hooks/persisted/useUserAgent';
import { expandURL } from '@services/plugin/fetch';

const WebviewScreen = ({ route, navigation }: WebviewScreenProps) => {
  const theme = useTheme();
  //  const safeAreaInsets = useSafeAreaInsets();

  const webViewRef = useRef<WebView | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const handleNavigation = (e: WebViewNavigation) => {
    setCurrentUrl(e.url);
    setCanGoBack(e.canGoBack);
    setCanGoForward(e.canGoForward);
  };

  const { name, url, pluginId, type } = route.params;

  return (
    <>
      <Appbar.Header style={{ backgroundColor: theme.surface }}>
        <Appbar.BackAction
          iconColor={theme.onSurface}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title={name} />
        <Appbar.Action
          icon="arrow-left"
          iconColor={theme.onSurface}
          disabled={!canGoBack}
          onPress={() => webViewRef.current?.goBack()}
        />
        <Appbar.Action
          icon="arrow-right"
          iconColor={theme.onSurface}
          disabled={!canGoForward}
          onPress={() => {
            webViewRef.current?.goForward();
            console.log('goForward');
          }}
        />
        <Appbar.Action icon="dots-vertical" onPress={() => console.log('1')} />
      </Appbar.Header>
      {progress !== 1 && (
        <ProgressBar color={theme.primary} progress={progress} />
      )}
      <WebView
        startInLoadingState
        ref={webViewRef}
        source={{
          uri: pluginId ? expandURL(pluginId, type || 'novel', url) : url,
        }}
        onLoadProgress={({ nativeEvent }) => {
          setProgress(nativeEvent.progress);
        }}
        onLoad={({ nativeEvent }) => {
          console.log(nativeEvent?.title);
        }}
        onNavigationStateChange={handleNavigation}
      />
    </>
  );
};

export default WebviewScreen;
