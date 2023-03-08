import { SectionList, StyleSheet, Text, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TabView, SceneMap } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';

import {
  fetchPluginsAction,
  searchSourcesAction,
  setLastUsedSource,
  togglePinSource,
  installPluginAction,
  uninstallPluginAction,
} from '@redux/source/sourcesSlice';
import {
  useAppDispatch,
  useBrowseSettings,
  useSourcesReducer,
} from '@redux/hooks';

import { useSearch } from '@hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import { fetchPlugins } from '@sources/pluginManager';

import { Languages } from '@utils/constants/languages';
import { PluginItem } from '@sources/types';
import { EmptyView, SearchbarV2 } from '@components';
import MalCard from './discover/MalCard/MalCard';
import PluginCard from './components/PluginCard';

const BrowseScreen = () => {
  const { navigate } = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const {
    availablePlugins = {} as Record<Languages, Array<PluginItem>>,
    installedPlugins = [],
    searchResults = [],
    pinnedPlugins = [],
    languagesFilter = ['English'],
    lastUsed,
  } = useSourcesReducer();
  const { showMyAnimeList = true, onlyShowPinnedSources = false } =
    useBrowseSettings();

  useEffect(() => {
    if (Object.keys(availablePlugins).length === 0) {
      fetchPlugins().then(plugins => dispatch(fetchPluginsAction(plugins)));
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlugins().then(plugins => {
      dispatch(fetchPluginsAction(plugins));
      setRefreshing(false);
    });
  };

  const onChangeText = (text: string) => {
    setSearchText(text);
    dispatch(searchSourcesAction(text));
  };

  const navigateToSource = useCallback(
    (plugin: PluginItem, showLatestNovels?: boolean) => {
      navigate(
        'SourceScreen' as never,
        {
          pluginId: plugin.id,
          name: plugin.name,
          url: plugin.url,
          showLatestNovels,
        } as never,
      );
      dispatch(setLastUsedSource(plugin));
    },
    [],
  );

  const searchbarActions = useMemo(
    () => [
      {
        iconName: 'book-search',
        onPress: () => navigate('GlobalSearchScreen' as never),
      },
      {
        iconName: 'swap-vertical-variant',
        onPress: () => navigate('Migration' as never),
      },
      {
        iconName: 'cog-outline',
        onPress: () => navigate('BrowseSettings' as never),
      },
    ],
    [],
  );

  const availableSections = useMemo(() => {
    const list = [];
    if (searchText) {
      list.unshift({
        header: getString('common.searchResults'),
        data: searchResults,
      });
    } else {
      languagesFilter.forEach(lang => {
        const plugins = availablePlugins[lang as Languages];
        if (plugins) {
          list.push({
            header: lang,
            data: plugins,
          });
        }
      });
    }
    return list;
  }, [
    lastUsed,
    JSON.stringify(searchResults),
    availablePlugins,
    languagesFilter,
    searchText,
  ]);

  const installedSections = useMemo(() => {
    const list = [];
    if (lastUsed) {
      list.push({
        header: getString('browseScreen.lastUsed'),
        data: [lastUsed],
      });
    }
    if (pinnedPlugins) {
      list.push({
        header: getString('browseScreen.pinned'),
        data: pinnedPlugins,
      });
    }

    if (!onlyShowPinnedSources) {
      if (searchText) {
        list.unshift({
          header: getString('common.searchResults'),
          data: searchResults,
        });
      } else {
        if (installedPlugins) {
          list.push({
            header: 'Installed plugins',
            data: installedPlugins,
          });
        }
      }
    }

    return list;
  }, [
    lastUsed,
    pinnedPlugins,
    onlyShowPinnedSources,
    JSON.stringify(searchResults),
    availablePlugins,
    languagesFilter,
    searchText,
  ]);

  const makeRoute = (
    sections: Array<{ header: string; data: Array<PluginItem> }>,
    installTab: boolean,
  ) => (
    <>
      {languagesFilter.length === 0 ? (
        <EmptyView
          icon="(･Д･。"
          description={getString('browseScreen.listEmpty')}
          theme={theme}
        />
      ) : (
        <>
          <SectionList
            sections={sections}
            ListHeaderComponent={
              showMyAnimeList && installTab ? (
                <>
                  <Text
                    style={[
                      styles.sectionHeader,
                      { color: theme.onSurfaceVariant },
                    ]}
                  >
                    {getString('browseScreen.discover')}
                  </Text>
                  {showMyAnimeList && <MalCard theme={theme} />}
                </>
              ) : null
            }
            keyExtractor={(_, index) => index.toString() + installTab}
            renderSectionHeader={({ section: { header, data } }) =>
              data.length > 0 ? (
                <Text
                  style={[
                    styles.sectionHeader,
                    { color: theme.onSurfaceVariant },
                  ]}
                >
                  {header}
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <PluginCard
                installed={
                  installedPlugins.find(plg => plg.id === item.id) !== undefined
                }
                plugin={item}
                isPinned={
                  installTab &&
                  pinnedPlugins.find(plg => plg.id === item.id) !== undefined
                }
                navigateToSource={navigateToSource}
                onTogglePinSource={plugin => dispatch(togglePinSource(plugin))}
                onInstallPlugin={plugin =>
                  dispatch(installPluginAction(plugin))
                }
                onUninstallPlugin={plugin =>
                  dispatch(uninstallPluginAction(plugin))
                }
                theme={theme}
              />
            )}
            refreshControl={
              installTab ? (
                <></>
              ) : (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.onPrimary]}
                  progressBackgroundColor={theme.primary}
                />
              )
            }
          />
        </>
      )}
    </>
  );

  const renderScene = SceneMap({
    availableRoute: () => makeRoute(availableSections, false),
    installedRoute: () => makeRoute(installedSections, true),
  });

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'installedRoute', title: 'Installed' },
    { key: 'availableRoute', title: 'Available' },
  ]);

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        placeholder={getString('browseScreen.searchbar')}
        leftIcon="magnify"
        onChangeText={onChangeText}
        clearSearchbar={clearSearchbar}
        theme={theme}
        rightIcons={searchbarActions}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
      />
    </>
  );
};

export default BrowseScreen;

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
