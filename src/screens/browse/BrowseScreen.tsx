import { Text } from 'react-native';
import React, { useMemo } from 'react';
import { TabView, TabBar } from 'react-native-tab-view';
import color from 'color';

import { useSearch } from '@hooks';
import { useBrowseSettings, usePlugins, useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

import { Language } from '@utils/constants/languages';
import { EmptyView, SearchbarV2 } from '@components';
import { BrowseScreenProps } from '@navigators/types';
import { PluginsMap } from '@hooks/persisted/usePlugins';
import PluginSection from './components/PluginSection';

const BrowseScreen = ({ navigation }: BrowseScreenProps) => {
  const theme = useTheme();
  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const {
    filteredAvailablePlugins,
    filteredInstalledPlugins,
    languagesFilter,
    lastUsedPlugin,
  } = usePlugins();

  const searchedInstalledPlugins = useMemo(() => {
    return filteredInstalledPlugins.filter(plg =>
      plg.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );
  }, [searchText, filteredInstalledPlugins]);

  const searchedAvailablePlugins = useMemo(() => {
    return languagesFilter.reduce((pre, cur) => {
      pre[cur] = filteredAvailablePlugins[cur]?.filter(plg =>
        plg.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
      );
      return pre;
    }, {} as PluginsMap);
  }, [searchText, filteredAvailablePlugins]);

  const { showMyAnimeList, showAniList } = useBrowseSettings();

  const searchbarActions = useMemo(
    () => [
      {
        iconName: 'book-search',
        onPress: () => navigation.navigate('GlobalSearchScreen', {}),
      },
      {
        iconName: 'swap-vertical-variant',
        onPress: () => navigation.navigate('Migration'),
      },
      {
        iconName: 'cog-outline',
        onPress: () => navigation.navigate('BrowseSettings'),
      },
    ],
    [],
  );

  const availableSections = useMemo(() => {
    const list = [];
    if (searchText) {
      list.push({
        header: getString('common.searchResults'),
        data: [],
      });
      languagesFilter.forEach(lang => {
        const plugins = searchedAvailablePlugins[lang as Language];
        if (plugins?.length) {
          list.push({
            header: lang,
            data: plugins,
          });
        }
      });
    } else {
      languagesFilter.forEach(lang => {
        const plugins = filteredAvailablePlugins[lang as Language];
        if (plugins?.length) {
          list.push({
            header: lang,
            data: plugins,
          });
        }
      });
    }
    return list;
  }, [searchedAvailablePlugins]);

  const installedSections = useMemo(() => {
    const list = [];
    if (searchText) {
      list.push({
        header: getString('common.searchResults'),
        data: searchedInstalledPlugins,
      });
    } else if (filteredInstalledPlugins.length) {
      if (lastUsedPlugin) {
        list.push({
          header: getString('browseScreen.lastUsed'),
          data: [lastUsedPlugin],
        });
      }
      list.push({
        header: getString('browseScreen.installedPlugins'),
        data: filteredInstalledPlugins,
      });
    }
    return list;
  }, [lastUsedPlugin, searchedInstalledPlugins]);

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'installedRoute', title: getString('browseScreen.installed') },
    { key: 'availableRoute', title: getString('browseScreen.available') },
  ]);

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        placeholder={getString('browseScreen.searchbar')}
        leftIcon="magnify"
        onChangeText={setSearchText}
        clearSearchbar={clearSearchbar}
        theme={theme}
        rightIcons={searchbarActions}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={({ route }) => {
          if (languagesFilter.length === 0) {
            return (
              <EmptyView
                icon="(･Д･。"
                description={getString('browseScreen.listEmpty')}
                theme={theme}
              />
            );
          }
          switch (route.key) {
            case 'availableRoute':
              return (
                <PluginSection
                  sections={availableSections}
                  installedTab={false}
                  theme={theme}
                  navigation={navigation}
                />
              );
            default:
              return (
                <PluginSection
                  sections={installedSections}
                  installedTab={true}
                  showMyAnimeList={showMyAnimeList}
                  showAnilist={showAniList}
                  theme={theme}
                  navigation={navigation}
                />
              );
          }
        }}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.primary }}
            style={{
              backgroundColor: theme.surface,
              borderBottomColor: color(theme.isDark ? '#FFFFFF' : '#000000')
                .alpha(0.12)
                .string(),
              borderBottomWidth: 1,
            }}
            renderLabel={({ route, color }) => (
              <Text style={{ color }}>{route.title}</Text>
            )}
            inactiveColor={theme.secondary}
            activeColor={theme.primary}
            android_ripple={{ color: theme.rippleColor }}
          />
        )}
      />
    </>
  );
};

export default BrowseScreen;
