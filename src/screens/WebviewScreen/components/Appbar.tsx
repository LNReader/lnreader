import React, { RefObject } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButtonV2 } from '@components';
import { ThemeColors } from '@theme/types';
import WebView from 'react-native-webview';

interface AppbarProps {
  title: string;
  theme: ThemeColors;
  canGoBack: boolean;
  canGoForward: boolean;
  webView: RefObject<WebView>;
  setMenuVisible: (value: boolean) => void;
  goBack: () => void;
}

const Appbar: React.FC<AppbarProps> = ({
  title,
  theme,
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
          numberOfLines={1}
          style={[styles.title, { color: theme.onSurface }]}
        >
          {title}
        </Text>
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
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    paddingBottom: 2,
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
