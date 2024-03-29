import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marquee } from '@animatereactnative/marquee';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButtonV2 } from '@components';
import { ThemeColors } from '@theme/types';

interface AppbarProps {
  title: string;
  theme: ThemeColors;
  currentUrl: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  webView: RefObject<WebView>;
  setMenuVisible: () => void;
  goBack: () => void;
}

const Appbar: React.FC<AppbarProps> = ({
  title,
  theme,
  currentUrl,
  loading,
  canGoBack,
  canGoForward,
  webView,
  setMenuVisible,
  goBack,
}) => {
  const { top } = useSafeAreaInsets();
  const [animating, setAnimating] = useState(false);

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

        <View style={{ display: loading || !animating ? 'flex' : 'none' }}>
          <Text
            numberOfLines={1}
            style={[styles.url, { color: theme.onSurfaceVariant }]}
            onTextLayout={({ nativeEvent: { lines } }) =>
              setAnimating(lines.length > 1)
            }
          >
            {currentUrl}
          </Text>
        </View>

        {!loading && animating && (
          <Marquee speed={0.8} spacing={50}>
            <Text style={[styles.url, { color: theme.onSurfaceVariant }]}>
              {currentUrl}
            </Text>
          </Marquee>
        )}
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
