import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      style={[
        styles.container,
        { paddingTop: top, backgroundColor: theme.surface },
      ]}
    >
      <IconButtonV2
        name="close"
        color={theme.onSurface}
        onPress={goBack}
        theme={theme}
      />
      <View style={styles.titleContainer}>
        <Text
          style={[styles.title, { color: theme.onSurface }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <TextTicker
          style={[styles.url, { color: theme.onSurfaceVariant }]}
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
      <View style={styles.iconContainer}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    paddingLeft: 2,
    fontSize: 18,
  },
  url: {
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
