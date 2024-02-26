import React, { useState } from 'react';
import { Share } from 'react-native';
import WebView from 'react-native-webview';
import { Appbar as PaperAppbar, Menu } from 'react-native-paper';
import * as Linking from 'expo-linking';

import { WebviewScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { showToast } from '@utils/showToast';

interface AppbarProps {
  title: string;
  theme: ThemeColors;
  currentUrl: string;
  canGoBack: Boolean;
  canGoForward: Boolean;
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
  const [visible, setVisible] = useState(false);

  return (
    <PaperAppbar.Header style={{ backgroundColor: theme.surface }}>
      <PaperAppbar.BackAction
        icon="close"
        iconColor={theme.onBackground}
        onPress={() => navigation.goBack()}
      />
      <PaperAppbar.Content
        title={title}
        titleStyle={{ color: theme.onSurface }}
      />
      <PaperAppbar.Action
        icon="arrow-left"
        iconColor={theme.onBackground}
        disabled={!canGoBack}
        onPress={() => webView.current?.goBack()}
      />
      <PaperAppbar.Action
        icon="arrow-right"
        iconColor={theme.onBackground}
        disabled={!canGoForward}
        onPress={() => webView.current?.goForward()}
      />
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <PaperAppbar.Action
            icon="dots-vertical"
            iconColor={theme.onBackground}
            onPress={() => setVisible(true)}
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
            setVisible(false);
            webView.current?.reload();
          }}
        />
        <Menu.Item
          title={getString('webview.share')}
          style={{ backgroundColor: theme.surface2 }}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => {
            setVisible(false);
            Share.share({ message: currentUrl });
          }}
        />
        <Menu.Item
          title={getString('webview.openInBrowser')}
          style={{ backgroundColor: theme.surface2 }}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => {
            setVisible(false);
            Linking.openURL(currentUrl);
          }}
        />
        <Menu.Item
          title={getString('webview.clearData')}
          style={{ backgroundColor: theme.surface2 }}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => {
            setVisible(false);
            webView.current?.clearCache(true);
            webView.current?.reload();
            showToast(getString('webview.dataDeleted'));
          }}
        />
      </Menu>
    </PaperAppbar.Header>
  );
};

export default Appbar;
