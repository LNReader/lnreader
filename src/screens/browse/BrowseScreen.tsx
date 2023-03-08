import { SectionList, StyleSheet, Text } from 'react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { TabView, SceneMap } from 'react-native-tab-view';

import { EmptyView, SearchbarV2 } from '../../components';
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
import { useTheme } from '@hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { useSearch } from '@hooks';
import SourceCard from './components/SourceCard/SourceCard';
import { getString } from '../../../strings/translations';
import { PluginItem } from '@sources/types';
import MalCard from './discover/MalCard/MalCard';
import { Languages } from '@utils/constants/languages';
import { fetchPlugins } from '@sources/pluginManager';

const BrowseScreen = () => {
  const { navigate } = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { searchText, setSearchText, clearSearchbar } = useSearch();

  const {
    availablePlugins = {} as Record<Languages, Array<PluginItem>>,
    installedPlugins = [],
    searchResults = [],
    pinnedPlugins = [],
    languagesFilter = ['English'],
    lastUsed,
  } = useSourcesReducer();

  useEffect(() => {
    if (Object.keys(availablePlugins).length === 0) {
      fetchPlugins().then(plugins => dispatch(fetchPluginsAction(plugins)));
    }
  }, []);
  const onChangeText = (text: string) => {
    setSearchText(text);
    dispatch(searchSourcesAction(text));
  };

  const handleClearSearchbar = () => {
    clearSearchbar();
    // dispatch(getSourcesAction());
  };

  const { showMyAnimeList = true, onlyShowPinnedSources = false } =
    useBrowseSettings();

  const isPinned = (plugin: PluginItem) =>
    pinnedPlugins.find(plg => plg.id === plugin.id) !== undefined;
  const isInstalled = (plugin: PluginItem) =>
    installedPlugins.find(plg => plg.id === plugin.id) !== undefined;

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

    if (!onlyShowPinnedSources) {
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

  const availableRoute = () => (
    <>
      {languagesFilter.length === 0 ? (
        <EmptyView
          icon={'(･Д･。'}
          description={getString('browseScreen.listEmpty')}
          theme={theme}
        />
      ) : Object.keys(availablePlugins).length === 0 ? null : (
        <>
          <SectionList
            sections={availableSections}
            keyExtractor={(_, index) => index.toString()}
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
              <SourceCard
                installed={isInstalled(item)}
                plugin={item}
                isPinned={isPinned(item)}
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
          />
        </>
      )}
    </>
  );

  const installedRoute = () => (
    <>
      {languagesFilter.length === 0 ? (
        <EmptyView
          icon="(･Д･。"
          description={getString('browseScreen.listEmpty')}
          theme={theme}
        />
      ) : installedPlugins.length === 0 ? null : (
        <>
          <SectionList
            sections={installedSections}
            ListHeaderComponent={
              showMyAnimeList ? (
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
            keyExtractor={(_, index) => index.toString()}
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
              <SourceCard
                installed={isInstalled(item)}
                plugin={item}
                isPinned={isPinned(item)}
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
          />
        </>
      )}
    </>
  );

  const renderScene = SceneMap({
    availableRoute: availableRoute,
    installedRoute: installedRoute,
  });

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'installedRoute', title: 'Installed Plugins' },
    { key: 'availableRoute', title: 'Available Plugins' },
  ]);

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        placeholder={getString('browseScreen.searchbar')}
        leftIcon="magnify"
        onChangeText={onChangeText}
        clearSearchbar={handleClearSearchbar}
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
