import { Button, IconButtonV2 } from '@components';
import { uninstallPlugin, updatePlugin } from '@plugins/pluginManager';
import { PluginItem } from '@plugins/types';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import React, { useState } from 'react';
import { Divider, Menu, overlay } from 'react-native-paper';

interface ExtendedButtonProps {
  plugin: PluginItem;
  isPinned: boolean;
  theme: ThemeColors;
  onTogglePinSource: (plugin: PluginItem) => void;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  onUninstallPlugin: (plugin: PluginItem) => void;
  onUpdatePlugin: (plugin: PluginItem) => void;
}

export const ExtendedButton: React.FC<ExtendedButtonProps> = ({
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
      contentStyle={{ backgroundColor: overlay(2, theme.surface) }}
    >
      <Button
        title={getString('browseScreen.latest')}
        textColor={theme.primary}
        onPress={() => navigateToSource(plugin, true)}
      />
      <Divider
        style={{
          height: 1,
          backgroundColor: theme.onSurfaceDisabled,
        }}
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
      <Divider
        style={{
          height: 1,
          backgroundColor: theme.onSurfaceDisabled,
        }}
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
