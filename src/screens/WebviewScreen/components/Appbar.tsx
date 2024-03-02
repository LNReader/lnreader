import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import WebView from 'react-native-webview';

import { ThemeColors } from '@theme/types';

interface AppbarProps {
  title: string;
  theme: ThemeColors;
  canGoBack: boolean;
  canGoForward: boolean;
  webView: RefObject<WebView>;
  goBack: () => void;
  setMenuVisible: () => void;
}

const Appbar: React.FC<AppbarProps> = ({
  title,
  theme,
  canGoBack,
  canGoForward,
  webView,
  goBack,
  setMenuVisible,
}) => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: top,
        backgroundColor: theme.surface,
        flexDirection: 'row',
      }}
    >
      <IconButton
        icon="close"
        iconColor={theme.onSurface}
        onPress={goBack}
        theme={{ colors: { ...theme } }}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            color: theme.onSurface,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.onSurface}
          disabled={!canGoBack}
          onPress={() => webView.current?.goBack()}
          theme={{ colors: { ...theme } }}
        />

        <IconButton
          icon="arrow-right"
          iconColor={theme.onSurface}
          disabled={!canGoForward}
          onPress={() => webView.current?.goForward()}
          theme={{ colors: { ...theme } }}
        />
        <IconButton
          icon="dots-vertical"
          iconColor={theme.onSurface}
          onPress={() => setMenuVisible(true)}
          theme={{ colors: { ...theme } }}
        />
      </View>
    </View>
  );
};

export default Appbar;
