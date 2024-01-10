import { StyleSheet, Text } from 'react-native';
import React, { useCallback, useEffect, useMemo } from 'react';

import { EmptyView, SearchbarV2 } from '../../components';
import {
  defaultLanguage,
  getSourcesAction,
  searchSourcesAction,
  setLastUsedSource,
  togglePinSource,
} from '../../redux/source/sourcesSlice';
import {
  useAppDispatch,
  useBrowseSettings,
  useSourcesReducer,
} from '../../redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { useSearch } from '../../hooks';
import SourceCard from './components/SourceCard/SourceCard';
import { getString } from '../../../strings/translations';
import { Source } from '../../sources/types';
import TrackerCard from './discover/TrackerCard';
import { FlashList } from '@shopify/flash-list';

const BrowseScreen = () => {
  const { navigate } = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { searchText, setSearchText, clearSearchbar } = useSearch();

  const onChangeText = (text: string) => {
    setSearchText(text);
    dispatch(searchSourcesAction(text));
  };

  const handleClearSearchbar = () => {
    clearSearchbar();
    dispatch(getSourcesAction());
  };

  const {
    allSources,
    searchResults,
    pinnedSourceIds = [],
    languageFilters = [defaultLanguage || 'English'], //defaultLang cant be null, but just for sure
    lastUsed,
  } = useSourcesReducer();

  const {
    showMyAnimeList = true,
    showAniList = true,
    onlyShowPinnedSources = false,
  } = useBrowseSettings();

  useEffect(() => {
    dispatch(getSourcesAction());
  }, [dispatch, languageFilters]);

  const isPinned = (sourceId: number) => pinnedSourceIds.indexOf(sourceId) > -1;

  const pinnedSources = allSources.filter(source => isPinned(source.sourceId));
  const lastUsedSource = lastUsed
    ? allSources.filter(source => source.sourceId === lastUsed)
    : [];

  const navigateToSource = useCallback(
    (source: Source, showLatestNovels?: boolean) => {
      //@ts-ignore
      navigate('SourceScreen', {
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        url: source.url,
        showLatestNovels,
      });
      dispatch(setLastUsedSource({ sourceId: source.sourceId }));
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

  class Header {
    public header: string = '';
    constructor(str: string) {
      this.header = str;
    }
  }

  type sectionType = Source | Header;
  const sections: sectionType[] = useMemo(() => {
    const list = [];
    if (lastUsedSource) {
      list.push(
        new Header(getString('browseScreen.lastUsed')),
        ...lastUsedSource,
      );
    }

    if (pinnedSourceIds) {
      list.push(new Header(getString('browseScreen.pinned')), ...pinnedSources);
    }

    if (onlyShowPinnedSources) {
      return list;
    }
    if (searchText) {
      return [new Header(getString('common.searchResults')), ...searchResults];
    } else {
      list.push(new Header(getString('browseScreen.all')), ...allSources);
    }

    return list;
  }, [
    lastUsedSource,
    pinnedSourceIds,
    onlyShowPinnedSources,
    JSON.stringify(searchResults),
    searchText,
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
      {languageFilters.length === 0 ? (
        <EmptyView
          icon="(･Д･。"
          description={getString('browseScreen.listEmpty')}
          theme={theme}
        />
      ) : allSources.length === 0 ? null : (
        <>
          <FlashList
            ListHeaderComponent={() => {
              return showMyAnimeList ? (
                <>
                  <Text
                    style={[
                      styles.sectionHeader,
                      { color: theme.onSurfaceVariant },
                    ]}
                  >
                    {getString('browseScreen.discover')}
                  </Text>
                  {showAniList && (
                    <TrackerCard
                      theme={theme}
                      icon={require('../../../assets/anilist.png')}
                      navTarget="BrowseAL"
                      trackerName="AniList"
                    />
                  )}
                  {showMyAnimeList && (
                    <TrackerCard
                      theme={theme}
                      icon={require('../../../assets/mal.png')}
                      navTarget="BrowseMal"
                      trackerName="MyAnimeList"
                    />
                  )}
                </>
              ) : (
                <></>
              );
            }}
            estimatedItemSize={50}
            data={sections}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => {
              if (item instanceof Header) {
                return (
                  <Text
                    style={[
                      styles.sectionHeader,
                      { color: theme.onSurfaceVariant },
                    ]}
                  >
                    {item.header}
                  </Text>
                );
              } else {
                return (
                  <SourceCard
                    source={item}
                    isPinned={isPinned(item.sourceId)}
                    navigateToSource={navigateToSource}
                    onTogglePinSource={sourceId =>
                      dispatch(togglePinSource(sourceId))
                    }
                    theme={theme}
                  />
                );
              }
            }}
          />
        </>
      )}
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
