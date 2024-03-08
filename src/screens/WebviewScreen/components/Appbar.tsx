import React from 'react';
import { View, Text } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButtonV2 } from '@components';
import { ThemeColors } from '@theme/types';

interface AppbarProps {
  title: string;
  theme: ThemeColors;
  loading: boolean;
  currentUrl: string;
  canGoBack: boolean;
  canGoForward: boolean;
  webView: RefObject<WebView>;
  setMenuVisible: () => void;
  goBack: () => void;
}

const Appbar: React.FC<AppbarProps> = ({
  title,
  theme,
  loading,
  currentUrl,
  canGoBack,
  canGoForward,
  webView,
  setMenuVisible,
  goBack,
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
      <IconButtonV2
        name="close"
        color={theme.onSurface}
        onPress={goBack}
        theme={theme}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            paddingLeft: 2,
            color: theme.onSurface,
            fontSize: 18,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <TextTicker
          style={{ color: theme.outline, fontSize: 16 }}
          loop
          scrollSpeed={45}
          bounceSpeed={100}
          marqueeDelay={1000}
          bounceDelay={1000}
          isInteraction={false}
          disabled={loading}
        >
          {currentUrl}
        </TextTicker>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <IconButtonV2
          name="arrow-left"
          color={theme.onSurface}
          disabled={!canGoBack}
          onPress={() => webView.current?.goBack()}
          theme={theme}
        />

        <IconButtonV2
          name="arrow-right"
          color={theme.onSurface}
          disabled={!canGoForward}
          onPress={() => webView.current?.goForward()}
          theme={theme}
        />

        <IconButtonV2
          name="dots-vertical"
          color={theme.onSurface}
          onPress={() => setMenuVisible(true)}
          theme={theme}
        />
      </View>
    </View>
  );
};

export default Appbar;
