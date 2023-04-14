import React, { useEffect } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';

import { Appbar } from '@components';
import { useTheme } from '@hooks/useTheme';
import useSourceStorage from '@hooks/useSourceStorage';
import { defaultUserAgentString } from '@utils/fetch/fetch';

type ReaderScreenRouteProps = RouteProp<{
  params: {
    name: string;
    pluginId: string;
    url: string;
  };
}>;

const WebviewScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const {
    params: { name, pluginId, url },
  } = useRoute<ReaderScreenRouteProps>();
  const { setSourceStorage } = useSourceStorage({ pluginId });

  useEffect(() => {
    CookieManager.get(url, true).then(cookies => {
      const cloudflareCookie = cookies?.cf_clearance;
      if (cloudflareCookie) {
        const cloudflareCookieString = `${cloudflareCookie.name}=${cloudflareCookie.value}`;
        setSourceStorage('cookies', cloudflareCookieString);
      }
    });
  }, []);

  return (
    <>
      <Appbar mode="small" title={name} handleGoBack={goBack} theme={theme} />
      <WebView
        startInLoadingState
        userAgent={defaultUserAgentString}
        source={{ uri: url }}
      />
    </>
  );
};

export default WebviewScreen;
