import React, { useState } from 'react';
import { Share, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Menu } from 'react-native-paper';
import WebView from 'react-native-webview';
import * as Linking from 'expo-linking';

import { WebviewScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { showToast } from '@utils/showToast';

interface AppbarProps {
  title: string;
  theme: ThemeColors;
  currentUrl: string;
  canGoBack: boolean;
  canGoForward: boolean;
  webView: RefObject<WebView>;
  navigation: WebviewScreenProps['navigation'];
}

const Appbar: React.FC<AppbarProps> = ({
  title,
  theme,
  currentUrl,
  canGoBack,
  canGoForward,
  webView,
  navigation,
}) => {
  const { top } = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

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
        onPress={() => navigation.goBack()}
        theme={{ colors: { ...theme } }}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            color: theme.onSurface,
            textAlign: 'center',
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
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

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              iconColor={theme.onSurface}
              onPress={() => setMenuVisible(true)}
              theme={{ colors: { ...theme } }}
            />
          }
          style={{ backgroundColor: theme.surface2 }}
          contentStyle={{ backgroundColor: theme.surface2 }}
        >
          <Menu.Item
            title={getString('webview.refresh')}
            style={{ backgroundColor: theme.surface2 }}
            titleStyle={{ color: theme.onSurface }}
            onPress={() => {
              setMenuVisible(false);
              webView.current?.reload();
            }}
          />
          <Menu.Item
            title={getString('webview.share')}
            style={{ backgroundColor: theme.surface2 }}
            titleStyle={{ color: theme.onSurface }}
            onPress={() => {
              setMenuVisible(false);
              Share.share({ message: currentUrl });
            }}
          />
          <Menu.Item
            title={getString('webview.openInBrowser')}
            style={{ backgroundColor: theme.surface2 }}
            titleStyle={{ color: theme.onSurface }}
            onPress={() => {
              setMenuVisible(false);
              Linking.openURL(currentUrl);
            }}
          />
          <Menu.Item
            title={getString('webview.clearData')}
            style={{ backgroundColor: theme.surface2 }}
            titleStyle={{ color: theme.onSurface }}
            onPress={() => {
              setMenuVisible(false);
              webView.current?.clearCache?.(true);
              webView.current?.reload();
              showToast(getString('webview.dataDeleted'));
            }}
          />
        </Menu>
      </View>
    </View>
  );
};

export default Appbar;
