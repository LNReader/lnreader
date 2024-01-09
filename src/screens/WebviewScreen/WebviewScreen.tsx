import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';

import { Appbar } from '@components';
import { useTheme } from '@hooks/useTheme';
import { defaultUserAgentString } from '@utils/fetch/fetch';

type ReaderScreenRouteProps = RouteProp<{
  params: {
    name: string;
    sourceId: number;
    url: string;
  };
}>;

const WebviewScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const {
    params: { name, url },
  } = useRoute<ReaderScreenRouteProps>();

  const syncCookies = () => {
    CookieManager.flush();
  };

  return (
    <>
      <Appbar mode="small" title={name} handleGoBack={goBack} theme={theme} />
      <WebView
        startInLoadingState
        userAgent={defaultUserAgentString}
        source={{ uri: url }}
        onNavigationStateChange={syncCookies}
      />
    </>
  );
};

export default WebviewScreen;
