import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { Button, IconButtonV2 } from '@components';

import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';

import { PluginItem } from '@plugins/types';
import { Image } from 'react-native';
import { showToast } from '@utils/showToast';
import { ActivityIndicator } from 'react-native-paper';
import { getString } from '@strings/translations';

interface Props {
  installed: boolean;
  plugin: PluginItem;
  theme: ThemeColors;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  installPlugin: (plugin: PluginItem) => Promise<void>;
  uninstallPlugin: (plugin: PluginItem) => Promise<void>;
  updatePlugin: (plugin: PluginItem) => Promise<string>;
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
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <Pressable
        style={styles.container}
        onPress={() => installed && navigateToSource(plugin)}
        android_ripple={{ color: theme.rippleColor }}
        onLongPress={() => {
          setIsLoading(true);
          updatePlugin(plugin)
            .then(version =>
              showToast(getString('browseScreen.updatedTo', { version })),
            )
            .catch((error: Error) => showToast(error.message))
            .finally(() => setIsLoading(false));
        }}
      >
        <View style={[styles.flexRow]}>
          <Image source={{ uri: plugin.iconUrl }} style={styles.icon} />
          <View style={styles.details}>
            <Text
              numberOfLines={1}
              style={[
                {
                  color: plugin.hasUpdate
                    ? theme.onSurfaceDisabled
                    : theme.onSurface,
                },
                styles.name,
              ]}
            >
              {plugin.name}
            </Text>
            <Text
              numberOfLines={1}
              style={[{ color: theme.onSurfaceVariant }, styles.addition]}
            >
              {`ID: ${plugin.id}`}
            </Text>
            <Text
              numberOfLines={1}
              style={[{ color: theme.onSurfaceVariant }, styles.addition]}
            >
              {`${plugin.lang} - ${plugin.version}`}
            </Text>
          </View>
        </View>
        <View style={styles.buttonGroup}>
          {installed ? (
            <Button
              title={getString('browseScreen.latest')}
              textColor={theme.primary}
              onPress={() => navigateToSource(plugin, true)}
            />
          ) : null}
          {!isLoading ? (
            <IconButtonV2
              name={installed ? 'delete' : 'download'}
              size={22}
              color={theme.primary}
              onPress={() => {
                setIsLoading(true);
                if (installed) {
                  uninstallPlugin(plugin)
                    .then(() =>
                      showToast(
                        getString('browseScreen.uninstalledPlugin', {
                          name: plugin.name,
                        }),
                      ),
                    )
                    .finally(() => setIsLoading(false));
                } else {
                  installPlugin(plugin)
                    .then(() =>
                      showToast(
                        getString('browseScreen.installedPlugin', {
                          name: plugin.name,
                        }),
                      ),
                    )
                    .catch((error: Error) => showToast(error.message))
                    .finally(() => setIsLoading(false));
                }
              }}
              theme={theme}
            />
          ) : (
            <ActivityIndicator color={theme.primary} size={22} />
          )}
        </View>
      </Pressable>
    </>
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
    flex: 7,
  },
  buttonGroup: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
