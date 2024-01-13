import { StyleSheet } from 'react-native';
import { Divider, Menu, overlay } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Button, IconButtonV2 } from '@components';
import { PluginItem } from '@plugins/types';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { RootStackParamList } from '@navigators/types';
import { showToast } from '@utils/showToast';

interface PluginMenuProps {
  plugin: PluginItem;
  theme: ThemeColors;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  uninstallPlugin: (plugin: PluginItem) => Promise<void>;
  updatePlugin: (plugin: PluginItem) => Promise<void>;
}

export const PluginMenu: React.FC<PluginMenuProps> = ({
  plugin,
  theme,
  navigateToSource,
  uninstallPlugin,
  updatePlugin,
}) => {
  const [visible, setVisible] = useState(false);
  const showMenu = () => setVisible(true);
  const hideMenu = () => setVisible(false);
  const { navigate } = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Menu
      visible={visible}
      onDismiss={hideMenu}
      anchor={
        <IconButtonV2
          name={'dots-vertical'}
          size={30}
          color={theme.primary}
          onPress={showMenu}
          theme={theme}
        />
      }
      contentStyle={[
        { backgroundColor: overlay(2, theme.surface) },
        styles.menu,
      ]}
    >
      <Button
        title={getString('browseScreen.latest')}
        textColor={theme.primary}
        onPress={() => navigateToSource(plugin, true)}
      />
      <Divider
        style={[{ backgroundColor: theme.onSurfaceDisabled }, styles.divider]}
      />
      <Button
        title="Update"
        icon={'arrow-up-circle'}
        textColor={theme.primary}
        onPress={() =>
          updatePlugin(plugin).then(() =>
            showToast(`Updated to ${plugin.version}`),
          )
        }
      />
      <Button
        title="Visit"
        icon={'web'}
        textColor={theme.primary}
        onPress={() => {
          navigate('WebviewScreen', {
            pluginId: plugin.id,
            name: plugin.name,
            url: plugin.site,
          });
        }}
      />
      <Divider
        style={[{ backgroundColor: theme.onSurfaceDisabled }, styles.divider]}
      />
      <Button
        title="Uninstall"
        icon={'delete'}
        onPress={() =>
          uninstallPlugin(plugin).then(() =>
            showToast(`Uninstalled ${plugin.name}`),
          )
        }
      />
    </Menu>
  );
};

const styles = StyleSheet.create({
  menu: {
    width: 150,
  },
  divider: {
    height: 1,
    marginBottom: 5,
  },
});
