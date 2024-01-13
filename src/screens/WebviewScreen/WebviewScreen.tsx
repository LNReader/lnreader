import React, { useEffect } from 'react';
import WebView from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';

import { Appbar } from '@components';
import { useTheme } from '@hooks/persisted';
import { defaultUserAgentString } from '@utils/fetch/fetch';
import { WebviewScreenProps } from '@navigators/types';
import { getPlugin } from '@plugins/pluginManager';

const WebviewScreen = ({ route, navigation }: WebviewScreenProps) => {
  const theme = useTheme();

  const { name, pluginId, url } = route.params;
  const plugin = getPlugin(pluginId);

  useEffect(() => {
    CookieManager.get(url, true).then(cookies => {
      const cloudflareCookie = cookies?.cf_clearance;
      if (cloudflareCookie) {
        const cloudflareCookieString = `${cloudflareCookie.name}=${cloudflareCookie.value}`;
        plugin.updateCookieString(cloudflareCookieString);
      }
    });
  }, []);

  return (
    <>
      <Appbar
        mode="small"
        title={name}
        handleGoBack={() => navigation.goBack()}
        theme={theme}
      />
      <WebView
        startInLoadingState
        userAgent={defaultUserAgentString}
        source={{ uri: url }}
      />
    </>
  );
};

export default WebviewScreen;
