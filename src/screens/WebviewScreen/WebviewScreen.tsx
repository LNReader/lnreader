import React from 'react';
import WebView from 'react-native-webview';

import { Appbar } from '@components';
import { useTheme } from '@hooks/persisted';
import { WebviewScreenProps } from '@navigators/types';
import { getUserAgent } from '@hooks/persisted/useUserAgent';
import { isUrlAbsolute } from '@plugins/helpers/isAbsoluteUrl';
import { expandURL } from '@services/plugin/fetch';

const WebviewScreen = ({ route, navigation }: WebviewScreenProps) => {
  const theme = useTheme();

  const { name, url, pluginId, type } = route.params;

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
        userAgent={getUserAgent()}
        source={{
          uri:
            pluginId && !isUrlAbsolute(url)
              ? expandURL(pluginId, type || 'novel', url)
              : url,
        }}
      />
    </>
  );
};

export default WebviewScreen;
