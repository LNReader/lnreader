import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { IconButtonV2 } from '@components';

import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';

import { PluginItem } from '@plugins/types';
import { PluginMenu } from './PluginMenu';
import FastImage from 'react-native-fast-image';
import { showToast } from '@utils/showToast';

interface Props {
  installed: boolean;
  plugin: PluginItem;
  theme: ThemeColors;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  installPlugin: (plugin: PluginItem) => Promise<void>;
  uninstallPlugin: (plugin: PluginItem) => Promise<void>;
  updatePlugin: (plugin: PluginItem) => Promise<void>;
}

const PluginCard: React.FC<Props> = ({
  installed,
  plugin,
  navigateToSource,
  theme,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
}) => (
  <Pressable
    style={styles.container}
    onPress={() => installed && navigateToSource(plugin)}
    android_ripple={{ color: theme.rippleColor }}
  >
    <View style={styles.flexRow}>
      <FastImage source={{ uri: plugin.iconUrl }} style={styles.icon} />
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
          theme={theme}
          navigateToSource={navigateToSource}
          uninstallPlugin={uninstallPlugin}
          updatePlugin={updatePlugin}
        />
      ) : (
        <>
          <IconButtonV2
            name={'download'}
            size={22}
            color={theme.primary}
            onPress={() =>
              installPlugin(plugin).then(() =>
                showToast(`Installed ${plugin.name}`),
              )
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
