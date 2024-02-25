import React, { useState } from 'react';
import { Share } from 'react-native';
import WebView from 'react-native-webview';
import { Appbar as PaperAppbar, Menu } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';

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
        iconColor={theme.onSurface}
        onPress={() => navigation.goBack()}
      />
      <PaperAppbar.Content title={title} />
      <PaperAppbar.Action
        icon="arrow-left"
        iconColor={theme.onSurface}
        disabled={!canGoBack}
        onPress={() => webView.current?.goBack()}
      />
      <PaperAppbar.Action
        icon="arrow-right"
        iconColor={theme.onSurface}
        disabled={!canGoForward}
        onPress={() => webView.current?.goForward()}
      />
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <PaperAppbar.Action
            icon="dots-vertical"
            iconColor={theme.onSurface}
            onPress={() => setVisible(true)}
          />
        }
      >
        <Menu.Item
          title={getString('webview.refresh')}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => webView.current?.reload()}
        />
        <Menu.Item
          title={getString('webview.share')}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => Share.share({ message: currentUrl })}
        />
        <Menu.Item
          title={getString('webview.openInBrowser')}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => WebBrowser.openBrowserAsync(currentUrl)}
        />
        <Menu.Item
          title={getString('webview.clearData')}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => {
            webView.current?.clearCache(true);
            showToast(getString('webview.dataDeleted'));
          }}
        />
      </Menu>
    </PaperAppbar.Header>
  );
};

export default Appbar;
