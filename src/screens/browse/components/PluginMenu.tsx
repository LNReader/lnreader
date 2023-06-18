import { StyleSheet } from 'react-native';
import { Divider, Menu, overlay } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Button, IconButtonV2 } from '@components';
import { PluginItem } from '@plugins/types';
import { uninstallPlugin, updatePlugin } from '@plugins/pluginManager';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';

interface PluginMenuProps {
  plugin: PluginItem;
  isPinned: boolean;
  theme: ThemeColors;
  onTogglePinSource: (plugin: PluginItem) => void;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  onUninstallPlugin: (plugin: PluginItem) => void;
  onUpdatePlugin: (plugin: PluginItem) => void;
}

export const PluginMenu: React.FC<PluginMenuProps> = ({
  plugin,
  isPinned,
  theme,
  onTogglePinSource,
  navigateToSource,
  onUninstallPlugin,
  onUpdatePlugin,
}) => {
  const [visible, setVisible] = useState(false);
  const showMenu = () => setVisible(true);
  const hideMenu = () => setVisible(false);
  const { navigate } = useNavigation();

  return (
    <Menu
      visible={visible}
      onDismiss={hideMenu}
      anchor={
        <IconButtonV2
          name={'dots-vertical'}
          size={30}
          color={isPinned ? theme.primary : theme.onSurfaceVariant}
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
        title={isPinned ? 'Unpin' : 'Pin'}
        icon={isPinned ? 'pin' : 'pin-outline'}
        textColor={isPinned ? theme.primary : theme.onSurfaceVariant}
        onPress={() => onTogglePinSource(plugin)}
      />
      <Button
        title="Update"
        icon={'arrow-up-circle'}
        textColor={theme.primary}
        onPress={() => {
          updatePlugin(plugin).then(updated => {
            if (updated) {
              plugin.version = updated.version;
              onUpdatePlugin(plugin);
            }
          });
        }}
      />
      <Button
        title="Visit"
        icon={'earth'}
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
          uninstallPlugin(plugin).then(() => onUninstallPlugin(plugin))
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
