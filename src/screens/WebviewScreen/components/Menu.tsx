import React from 'react';
import { Share, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'react-native-paper';
import WebView from 'react-native-webview';
import * as Linking from 'expo-linking';

import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { showToast } from '@utils/showToast';

interface CustomMenuProps {
  theme: ThemeColors;
  currentUrl: string;
  webView: RefObject<WebView>;
  visible: boolean;
  setMenuVisible: () => void;
}

const CustomMenu: React.FC<CustomMenuProps> = ({
  theme,
  currentUrl,
  webView,
  visible,
  setMenuVisible,
}) => {
  const windowWidth = Dimensions.get('window').width;
  const { top } = useSafeAreaInsets();

  return (
    <Menu
      visible={visible}
      onDismiss={() => setMenuVisible(false)}
      anchor={{ x: windowWidth, y: top }}
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
  );
};

export default CustomMenu;
