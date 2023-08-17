import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';

import { IconButtonV2 } from '@components';

import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';

import { PluginItem } from '@plugins/types';
import { installPlugin } from '@plugins/pluginManager';
import { PluginMenu } from './PluginMenu';

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
        <Text style={{ color: theme.onSurface, fontWeight: 'bold' }}>
          {`ID: ${plugin.id}`}
        </Text>
        <Text style={[{ color: theme.onSurfaceVariant }]}>
          {`${plugin.lang}\n${plugin.version}`}
        </Text>
      </View>
    </View>
    <View style={styles.flexRow}>
      {installed ? (
        <PluginMenu
          plugin={plugin}
          isPinned={isPinned}
          theme={theme}
          onTogglePinSource={onTogglePinSource}
          navigateToSource={navigateToSource}
          onUninstallPlugin={onUninstallPlugin}
          onUpdatePlugin={onUpdatePlugin}
        />
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
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
