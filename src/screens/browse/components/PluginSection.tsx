import React, { memo, useCallback, useState } from 'react';
import { PluginItem } from '@plugins/types';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { RefreshControl, SectionList, StyleSheet, Text } from 'react-native';
import PluginCard from './PluginCard';
import { usePlugins } from '@hooks/persisted';
import { BrowseScreenProps } from '@navigators/types';
import TrackerCard from '../discover/TrackerCard';

interface PluginSectionProps {
  sections: { header: string; data: PluginItem[] }[];
  showMyAnimeList?: boolean;
  showAnilist?: boolean;
  installedTab: boolean;
  theme: ThemeColors;
  navigation: BrowseScreenProps['navigation'];
}

const PluginSection = ({
  sections,
  showMyAnimeList,
  showAnilist,
  installedTab,
  theme,
  navigation,
}: PluginSectionProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    refreshPlugins,
    installPlugin,
    uninstallPlugin,
    updatePlugin,
    setLastUsedPlugin,
  } = usePlugins();
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
    [],
  );

  return (
    <SectionList
      sections={sections}
      ListHeaderComponent={
        showMyAnimeList && installedTab ? (
          <>
            <Text
              style={[styles.sectionHeader, { color: theme.onSurfaceVariant }]}
            >
              {getString('browseScreen.discover')}
            </Text>
            {showAnilist ? (
              <TrackerCard
                theme={theme}
                icon={require('../../../../assets/anilist.png')}
                trackerName="Anilist"
                onPress={() => navigation.navigate('BrowseAL')}
              />
            ) : null}
            {showMyAnimeList ? (
              <TrackerCard
                theme={theme}
                icon={require('../../../../assets/mal.png')}
                trackerName="MyAnimeList"
                onPress={() => navigation.navigate('BrowseMal')}
              />
            ) : null}
          </>
        ) : null
      }
      keyExtractor={(_, index) => index.toString() + installedTab}
      renderSectionHeader={({ section: { header, data } }) => (
        <Text
          style={[
            styles.sectionHeader,
            {
              color: data.length === 0 ? theme.primary : theme.onSurfaceVariant,
            },
          ]}
        >
          {header}
        </Text>
      )}
      renderItem={({ item }) => (
        <PluginCard
          installed={installedTab}
          plugin={item}
          navigateToSource={navigateToSource}
          installPlugin={installPlugin}
          uninstallPlugin={uninstallPlugin}
          updatePlugin={updatePlugin}
          theme={theme}
        />
      )}
      refreshControl={
        installedTab ? (
          <></>
        ) : (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshPlugins().finally(() => setRefreshing(false));
            }}
            colors={[theme.onPrimary]}
            progressBackgroundColor={theme.primary}
          />
        )
      }
    />
  );
};

export default memo(PluginSection);

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
