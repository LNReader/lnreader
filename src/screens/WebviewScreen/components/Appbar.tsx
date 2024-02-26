import React, { useState } from 'react';
import { Share, View, Text } from 'react-native';
import { Menu } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
        paddingBottom: insets.bottom,
        paddingHorizontal: insets.left || insets.right ? insets.left : 10,
        backgroundColor: theme.surface,
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
      }}
    >
      <IconButtonV2
        icon="close"
        color={theme.onBackground}
        onPress={() => navigation.goBack()}
        theme={theme}
      />

      <View style={{ alignItems: 'center' }}>
        <Text
          numberOfLines={1}
          style={{ color: theme.onSurface, fontWeight: 'bold', fontSize: 16 }}
        >
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <IconButtonV2
          icon="arrow-left"
          color={theme.onBackground}
          disabled={!canGoBack}
          onPress={() => webView.current?.goBack()}
          theme={theme}
        />

        <IconButtonV2
          icon="arrow-right"
          color={theme.onBackground}
          disabled={!canGoForward}
          onPress={() => webView.current?.goForward()}
          theme={theme}
        />
      </View>

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
        titleStyle={{ color: theme.onSurface }}
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
