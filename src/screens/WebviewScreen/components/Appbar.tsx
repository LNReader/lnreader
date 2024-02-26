import React, { useState } from 'react';
import { Share, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'react-native-paper';
import WebView from 'react-native-webview';
import * as Linking from 'expo-linking';

import IconButtonV2 from '@components/IconButtonV2/IconButtonV2';
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
  webView: WebView;
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
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: insets.left || insets.right || 10,
        backgroundColor: theme.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <IconButtonV2
        icon="close"
        color={theme.onSurface}
        onPress={() => navigation.goBack()}
        theme={theme}
      />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: theme.onSurface }}>{title}</Text>
      </View>

      <IconButtonV2
        icon="arrow-left"
        color={theme.onSurface}
        disabled={!canGoBack}
        onPress={() => webView.current?.goBack()}
        theme={theme}
      />

      <IconButtonV2
        icon="arrow-right"
        color={theme.onSurface}
        disabled={!canGoForward}
        onPress={() => webView.current?.goForward()}
        theme={theme}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButtonV2
            icon="dots-vertical"
            color={theme.onSurface}
            onPress={() => setMenuVisible(true)}
            theme={theme}
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
            webView.current?.clearCache(true);
            webView.current?.reload();
            showToast(getString('webview.dataDeleted'));
          }}
        />
      </Menu>
    </View>
  );
};

export default Appbar;
