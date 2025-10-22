import React, { useCallback, useMemo, useState, memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Portal } from 'react-native-paper';
import { LegendList, LegendListRenderItemProps } from '@legendapp/list';

import { useBrowseSettings, usePlugins } from '@hooks/persisted';
import { PluginItem } from '@plugins/types';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import { BrowseScreenProps } from '@navigators/types';
import { useBoolean } from '@hooks';
import { getPlugin } from '@plugins/pluginManager';

import DiscoverCard from '../discover/DiscoverCard';
import SourceSettingsModal from './Modals/SourceSettings';
import { DeferredPluginListItem } from './DeferredPluginListItem';

interface InstalledTabProps {
  navigation: BrowseScreenProps['navigation'];
  theme: ThemeColors;
  searchText: string;
}

export const InstalledTab = memo(
  ({ navigation, theme, searchText }: InstalledTabProps) => {
    const {
      filteredInstalledPlugins,
      lastUsedPlugin,
      setLastUsedPlugin,
      pinnedPlugins,
    } = usePlugins();
    const { showMyAnimeList, showAniList } = useBrowseSettings();
    const settingsModal = useBoolean();
    const [selectedPluginId, setSelectedPluginId] = useState<string>('');

    const pluginSettings = selectedPluginId
      ? getPlugin(selectedPluginId)?.pluginSettings
      : undefined;

    const navigateToSource = useCallback(
      (plugin: PluginItem, showLatestNovels?: boolean) => {
        navigation.navigate('SourceScreen', {
          pluginId: plugin.id,
          pluginName: plugin.name,
          site: plugin.site,
          showLatestNovels,
        });
        setLastUsedPlugin(plugin);
      },
      [navigation, setLastUsedPlugin],
    );

    const { pinnedPluginsList, unpinnedPluginsList } = useMemo(() => {
      const sortedInstalledPlugins = filteredInstalledPlugins.sort(
        (plgFirst, plgSecond) => plgFirst.name.localeCompare(plgSecond.name),
      );

      const pinned: PluginItem[] = [];
      const unpinned: PluginItem[] = [];

      sortedInstalledPlugins.forEach(plugin => {
        if (pinnedPlugins.includes(plugin.id)) {
          pinned.push(plugin);
        } else {
          unpinned.push(plugin);
        }
      });

      return {
        pinnedPluginsList: pinned,
        unpinnedPluginsList: unpinned,
      };
    }, [filteredInstalledPlugins, pinnedPlugins]);

    const searchedPlugins = useMemo(() => {
      if (searchText) {
        const lowerCaseSearchText = searchText.toLocaleLowerCase();
        return [...pinnedPluginsList, ...unpinnedPluginsList].filter(
          plg =>
            plg.name.toLocaleLowerCase().includes(lowerCaseSearchText) ||
            plg.id.includes(lowerCaseSearchText),
        );
      }
      return unpinnedPluginsList;
    }, [searchText, pinnedPluginsList, unpinnedPluginsList]);

    const renderItem = useCallback(
      ({ item }: LegendListRenderItemProps<PluginItem>) => {
        return (
          <DeferredPluginListItem
            item={item}
            theme={theme}
            navigation={navigation}
            settingsModal={settingsModal}
            navigateToSource={navigateToSource}
            setSelectedPluginId={setSelectedPluginId}
          />
        );
      },
      [theme, navigation, navigateToSource, settingsModal],
    );

    return (
      <LegendList
        estimatedItemSize={64}
        data={searchedPlugins}
        recycleItems
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id + '_installed'}
        drawDistance={100}
        ListHeaderComponent={
          <>
            {/* Discover Section */}
            {showMyAnimeList || showAniList ? (
              <>
                <Text
                  style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
                >
                  {getString('browseScreen.discover')}
                </Text>
                {showAniList ? (
                  <DiscoverCard
                    theme={theme}
                    icon={require('../../../../assets/anilist.png')}
                    trackerName="Anilist"
                    onPress={() => navigation.navigate('BrowseAL')}
                  />
                ) : null}
                {showMyAnimeList ? (
                  <DiscoverCard
                    theme={theme}
                    icon={require('../../../../assets/mal.png')}
                    trackerName="MyAnimeList"
                    onPress={() => navigation.navigate('BrowseMal')}
                  />
                ) : null}
              </>
            ) : null}

            {/* Pinned Plugins Section */}
            {!searchText && pinnedPluginsList.length > 0 ? (
              <>
                <Text
                  style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
                >
                  {getString('browseScreen.pinnedPlugins')}
                </Text>
                {pinnedPluginsList.map(plugin => (
                  <DeferredPluginListItem
                    key={plugin.id}
                    item={plugin}
                    theme={theme}
                    navigation={navigation}
                    settingsModal={settingsModal}
                    navigateToSource={navigateToSource}
                    setSelectedPluginId={setSelectedPluginId}
                  />
                ))}
              </>
            ) : null}

            {/* Last Used Section */}
            {!searchText &&
            lastUsedPlugin &&
            !pinnedPlugins.includes(lastUsedPlugin.id) ? (
              <>
                <Text
                  style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
                >
                  {getString('browseScreen.lastUsed')}
                </Text>
                <DeferredPluginListItem
                  item={lastUsedPlugin}
                  theme={theme}
                  navigation={navigation}
                  settingsModal={settingsModal}
                  navigateToSource={navigateToSource}
                  setSelectedPluginId={setSelectedPluginId}
                />
              </>
            ) : null}

            {/* All Installed Plugins Section */}
            <Text
              style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
            >
              {searchText
                ? getString('browseScreen.searchResults')
                : getString('browseScreen.installedPlugins')}
            </Text>

            <Portal>
              <SourceSettingsModal
                visible={settingsModal.value}
                onDismiss={settingsModal.setFalse}
                title={getString('browseScreen.settings.title')}
                description={getString('browseScreen.settings.description')}
                pluginId={selectedPluginId}
                pluginSettings={pluginSettings}
              />
            </Portal>
          </>
        }
      />
    );
  },
);

const styles = StyleSheet.create({
  listHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
