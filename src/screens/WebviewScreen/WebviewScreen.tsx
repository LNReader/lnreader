import React from 'react';
import WebView from 'react-native-webview';

import { Appbar } from '@components';
import { useTheme } from '@hooks/persisted';
import { defaultUserAgentString } from '@utils/fetch/fetch';
import { WebviewScreenProps } from '@navigators/types';
import { getPlugin } from '@plugins/pluginManager';

const WebviewScreen = ({ route, navigation }: WebviewScreenProps) => {
  const theme = useTheme();

  const { name, pluginId, url } = route.params;
  const plugin = getPlugin(pluginId);

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
        userAgent={plugin.userAgent || defaultUserAgentString}
        source={{ uri: url }}
      />
    </>
  );
};

export default WebviewScreen;
