import React from 'react';
import WebView from 'react-native-webview';

import { Appbar } from '@components';
import { useTheme } from '@hooks/persisted';
import { WebviewScreenProps } from '@navigators/types';
import { getUserAgent } from '@hooks/persisted/useUserAgent';

const WebviewScreen = ({ route, navigation }: WebviewScreenProps) => {
  const theme = useTheme();

  const { name, url } = route.params;

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
        source={{ uri: url }}
      />
    </>
  );
};

export default WebviewScreen;
