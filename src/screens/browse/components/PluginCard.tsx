import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';

import { getString } from '@strings/translations';
import { Button, IconButtonV2 } from '@components';

import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';

import { PluginItem } from '@plugins/types';
import {
  installPlugin,
  uninstallPlugin,
  updatePlugin,
} from '@plugins/pluginManager';

interface Props {
  installed: boolean;
  plugin: PluginItem;
  isPinned: boolean;
  theme: ThemeColors;
  onTogglePinSource: (plugin: PluginItem) => void;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  onInstallPlugin: (plugin: PluginItem) => void;
  onUninstallPlugin: (plugin: PluginItem) => void;
  onUpdatePlugin: (plugin: PluginItem) => void;
}

const PluginCard: React.FC<Props> = ({
  installed,
  plugin,
  isPinned,
  navigateToSource,
  onTogglePinSource,
  theme,
  onInstallPlugin,
  onUninstallPlugin,
  onUpdatePlugin,
}) => (
  <Pressable
    style={styles.container}
    onPress={() => installed && navigateToSource(plugin)}
    android_ripple={{ color: theme.rippleColor }}
  >
    <View style={styles.flexRow}>
      <Image source={{ uri: plugin.iconUrl }} style={styles.icon} />
      <View style={styles.details}>
        <Text style={{ color: theme.onSurface }}>{plugin.name}</Text>
        <Text style={[{ color: theme.onSurfaceVariant }, styles.lang]}>
          {`ID: ${plugin.id}\n${plugin.lang}\nVer: ${plugin.version}`}
        </Text>
      </View>
    </View>
    <View style={styles.flexRow}>
      {installed ? (
        <>
          <Button
            title={getString('browseScreen.latest')}
            textColor={theme.primary}
            onPress={() => navigateToSource(plugin, true)}
          />
          <IconButtonV2
            name={isPinned ? 'pin' : 'pin-outline'}
            size={22}
            color={isPinned ? theme.primary : theme.onSurfaceVariant}
            onPress={() => onTogglePinSource(plugin)}
            theme={theme}
          />
          <IconButtonV2
            name={'arrow-up-circle'}
            size={22}
            color={theme.primary}
            onPress={() => {
              updatePlugin(plugin).then(updated => {
                if (updated) {
                  plugin.version = updated.version;
                  onUpdatePlugin(plugin);
                }
              });
            }}
            theme={theme}
          />
          <IconButtonV2
            name={'delete'}
            size={22}
            color={theme.primary}
            onPress={() =>
              uninstallPlugin(plugin).then(() => onUninstallPlugin(plugin))
            }
            theme={theme}
          />
        </>
      ) : (
        <>
          <IconButtonV2
            name={'download'}
            size={22}
            color={theme.primary}
            onPress={() =>
              installPlugin(plugin.url).then(res => {
                if (res) {
                  onInstallPlugin(plugin);
                }
              })
            }
            theme={theme}
          />
        </>
      )}
    </View>
  </Pressable>
);

export default PluginCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 12,
  },
  icon: {
    height: 45,
    width: 45,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  details: {
    marginLeft: 16,
  },
  lang: {
    fontSize: 12,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
