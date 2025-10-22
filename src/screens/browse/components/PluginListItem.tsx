import React, { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, Image, View, Text, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { usePlugins } from '@hooks/persisted';
import { PluginItem } from '@plugins/types';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import { BrowseScreenProps } from '@navigators/types';
import { Button, IconButtonV2 } from '@components';
import { showToast } from '@utils/showToast';
import { UseBooleanReturnType } from '@hooks';
import ConfirmationDialog from '@components/ConfirmationDialog/ConfirmationDialog';

interface PluginListItemProps {
  item: PluginItem;
  theme: ThemeColors;
  navigation: BrowseScreenProps['navigation'];
  settingsModal: UseBooleanReturnType;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  setSelectedPluginId: React.Dispatch<React.SetStateAction<string>>;
}

export const PluginListItem = memo(
  ({
    item,
    theme,
    navigation,
    settingsModal,
    navigateToSource,
    setSelectedPluginId,
  }: PluginListItemProps) => {
    const { uninstallPlugin, updatePlugin, togglePinPlugin, isPinned } =
      usePlugins();

    const isPluginPinned = isPinned(item.id);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const leftActionStyle = useMemo(
      () => [styles.buttonGroup, { backgroundColor: theme.secondary }],
      [theme.inverseSurface],
    );
    const rightActionStyle = useMemo(
      () => [styles.buttonGroup, { backgroundColor: theme.primary }],
      [theme.error],
    );
    const containerStyle = useMemo(
      () => [styles.container, { backgroundColor: theme.surface }],
      [theme.surface],
    );
    const iconStyle = useMemo(
      () => [styles.icon, { backgroundColor: theme.surface }],
      [theme.surface],
    );
    const nameStyle = useMemo(
      () => [{ color: theme.onSurface }, styles.name],
      [theme.onSurface],
    );
    const additionStyle = useMemo(
      () => [{ color: theme.onSurfaceVariant }, styles.addition],
      [theme.onSurfaceVariant],
    );

    const handleWebviewPress = useCallback(
      (ref: any) => {
        ref.close();
        navigation.navigate('WebviewScreen', {
          name: item.name,
          url: item.site,
          pluginId: item.id,
        });
      },
      [navigation, item],
    );

    const handlePinPress = useCallback(
      (ref: any) => {
        ref.close();
        togglePinPlugin(item.id);
        showToast(
          isPluginPinned
            ? getString('browseScreen.unpinnedPlugin', { name: item.name })
            : getString('browseScreen.pinnedPlugin', { name: item.name }),
        );
      },
      [togglePinPlugin, item.id, item.name, isPluginPinned],
    );

    const handleDeletePress = useCallback((ref: any) => {
      ref.close();
      setShowDeleteDialog(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
      uninstallPlugin(item).then(() =>
        showToast(
          getString('browseScreen.uninstalledPlugin', {
            name: item.name,
          }),
        ),
      );
    }, [uninstallPlugin, item]);

    const handleSettingsPress = useCallback(() => {
      setSelectedPluginId(item.id);
      settingsModal.setTrue();
    }, [setSelectedPluginId, item.id, settingsModal]);

    const handleUpdatePress = useCallback(() => {
      updatePlugin(item)
        .then(version =>
          showToast(getString('browseScreen.updatedTo', { version })),
        )
        .catch((error: Error) => showToast(error.message));
    }, [updatePlugin, item]);

    const handleLatestPress = useCallback(() => {
      navigateToSource(item, true);
    }, [navigateToSource, item]);

    const handlePress = useCallback(() => {
      navigateToSource(item);
    }, [navigateToSource, item]);

    // Memoized render actions
    const renderLeftActions = useCallback(
      (_progress: any, _dragX: any, ref: any) => (
        <View style={leftActionStyle}>
          <IconButtonV2
            name="earth"
            size={22}
            color={theme.onSecondary}
            onPress={() => handleWebviewPress(ref)}
            theme={theme}
          />
        </View>
      ),
      [leftActionStyle, theme, handleWebviewPress],
    );

    const renderRightActions = useCallback(
      (_progress: any, _dragX: any, ref: any) => (
        <View style={styles.rightActionsContainer}>
          <View style={rightActionStyle}>
            <IconButtonV2
              name={isPluginPinned ? 'pin-off' : 'pin'}
              size={22}
              color={theme.onPrimary}
              onPress={() => handlePinPress(ref)}
              theme={theme}
            />
          </View>
          <View style={[rightActionStyle]}>
            <IconButtonV2
              name="delete"
              size={22}
              color={theme.onPrimary}
              onPress={() => handleDeletePress(ref)}
              theme={theme}
            />
          </View>
        </View>
      ),
      [
        rightActionStyle,
        theme,
        handlePinPress,
        handleDeletePress,
        isPluginPinned,
      ],
    );

    return (
      <>
        <Swipeable
          dragOffsetFromLeftEdge={30}
          dragOffsetFromRightEdge={30}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
        >
          <Pressable
            style={containerStyle}
            android_ripple={{ color: theme.rippleColor }}
            onPress={handlePress}
          >
            <View style={[styles.center, styles.row]}>
              <Image source={{ uri: item.iconUrl }} style={iconStyle} />
              <View style={styles.details}>
                <Text numberOfLines={1} style={nameStyle}>
                  {item.name}
                </Text>
                <Text numberOfLines={1} style={additionStyle}>
                  {`${item.lang} - ${item.version}`}
                </Text>
              </View>
            </View>
            <View style={styles.flex} />
            <Button
              title={getString('browseScreen.latest')}
              textColor={theme.primary}
              onPress={handleLatestPress}
            />
            {item.hasSettings ? (
              <IconButtonV2
                name="cog-outline"
                size={22}
                color={theme.primary}
                onPress={handleSettingsPress}
                theme={theme}
              />
            ) : null}
            {item.hasUpdate || __DEV__ ? (
              <IconButtonV2
                name="download-outline"
                size={22}
                color={theme.primary}
                onPress={handleUpdatePress}
                theme={theme}
              />
            ) : null}
          </Pressable>
        </Swipeable>
        <ConfirmationDialog
          visible={showDeleteDialog}
          title={getString('common.delete')}
          message={getString('browseScreen.deletePluginMessage', {
            name: item.name,
          })}
          onSubmit={handleConfirmDelete}
          onDismiss={() => setShowDeleteDialog(false)}
          theme={theme}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  addition: {
    fontSize: 12,
    lineHeight: 20,
  },
  buttonGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  center: { alignItems: 'center' },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  details: {
    marginLeft: 16,
  },
  flex: { flex: 1 },
  icon: {
    borderRadius: 4,
    height: 40,
    width: 40,
  },
  name: {
    fontWeight: 'bold',
    lineHeight: 20,
  },
  pinnedIndicator: {
    marginRight: -8,
  },
  rightActionsContainer: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
  },
});
