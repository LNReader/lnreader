import React, { RefObject } from 'react';
import { Pressable, Share, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';

import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { showToast } from '@utils/showToast';

interface MenuProps {
  theme: ThemeColors;
  currentUrl: string;
  webView: RefObject<WebView>;
  setMenuVisible: (value: boolean) => void;
}

const Menu: React.FC<MenuProps> = ({
  theme,
  currentUrl,
  webView,
  setMenuVisible,
}) => {
  const { top } = useSafeAreaInsets();

  return (
    <Pressable onPress={() => setMenuVisible(false)} style={styles.container}>
      <View style={[styles.menuContainer, { top }]}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.surface2 }]}
          onPress={() => {
            setMenuVisible(false);
            webView.current?.reload();
          }}
        >
          <Text style={{ color: theme.onSurface }}>
            {getString('webview.refresh')}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.surface2 }]}
          onPress={() => {
            setMenuVisible(false);
            Share.share({ message: currentUrl });
          }}
        >
          <Text style={{ color: theme.onSurface }}>
            {getString('webview.share')}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.surface2 }]}
          onPress={() => {
            setMenuVisible(false);
            Linking.openURL(currentUrl);
          }}
        >
          <Text style={{ color: theme.onSurface }}>
            {getString('webview.openInBrowser')}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.surface2 }]}
          onPress={() => {
            setMenuVisible(false);
            webView.current?.clearCache?.(true);
            webView.current?.reload();
            showToast(getString('webview.dataDeleted'));
          }}
        >
          <Text style={{ color: theme.onSurface }}>
            {getString('webview.clearData')}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
  },
  menuButton: {
    padding: 15,
  },
});
