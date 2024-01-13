import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { IconButtonV2 } from '@components';

import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';

import { PluginItem } from '@plugins/types';
import { PluginMenu } from './PluginMenu';
import FastImage from 'react-native-fast-image';
import { showToast } from '@utils/showToast';
import { ActivityIndicator } from 'react-native-paper';

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
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  return (
    <Pressable
      style={styles.container}
      onPress={() => installed && navigateToSource(plugin)}
      android_ripple={{ color: theme.rippleColor }}
    >
      <View style={styles.flexRow}>
        <FastImage source={{ uri: plugin.iconUrl }} style={styles.icon} />
        <View style={styles.details}>
          <Text style={[{ color: theme.onSurface }, styles.name]}>
            {plugin.name}
          </Text>
          <Text style={[{ color: theme.onSurfaceVariant }, styles.addition]}>
            {`ID: ${plugin.id}`}
          </Text>
          <Text style={[{ color: theme.onSurfaceVariant }, styles.addition]}>
            {`${plugin.lang} - ${plugin.version}`}
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
            {!isInstalling ? (
              <IconButtonV2
                name={'download'}
                size={22}
                color={theme.primary}
                onPress={() => {
                  setIsInstalling(true);
                  installPlugin(plugin)
                    .then(() => showToast(`Installed ${plugin.name}`))
                    .finally(() => setIsInstalling(false));
                }}
                theme={theme}
              />
            ) : (
              <ActivityIndicator color={theme.primary} size={22} />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

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
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  details: {
    marginLeft: 16,
  },
  addition: {
    textAlign: 'left',
    fontSize: 12,
    fontWeight: '300',
  },
  name: {
    fontWeight: 'bold',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
