import React from 'react';
import {StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

import {
  Container,
  NovelCover,
  LoadingScreen,
  NovelList,
  LoadingMoreIndicator,
  ErrorScreen,
  Searchbar,
} from '../../components';
import {useSearch} from '../../hooks';

import {useTheme} from '../../redux/hooks';
import {useBrowseSource} from './hooks/useBrowseSource';
import {useSearchSource} from './hooks/useSearchSource';
import useLibrary from '../LibraryScreen/hooks/useLibrary';

interface BrowseSourceScreenProps {
  route: {
    params: {
      item: {
        id: number;
        name: string;
        baseUrl: string;
      };
    };
  };
}

const BrowseSourceScreen: React.FC<BrowseSourceScreenProps> = ({route}) => {
  const theme = useTheme();
  const {navigate, goBack} = useNavigation();

  const {
    id: sourceId,
    name: sourceName,
    baseUrl: sourceUrl,
  } = route.params.item;

  const {isLoading, novels, hasNextPage, fetchNextPage, error} =
    useBrowseSource(sourceId);

  const {
    isSearching,
    searchResults,
    searchSource,
    clearSearchResults,
    searchError,
  } = useSearchSource(sourceId);

  let novelList = searchResults.length > 0 ? searchResults : novels;

  const {searchText, setSearchText, clearSearchbar} = useSearch();
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => searchSource(searchText);
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  const handleOpenWebView = () => WebBrowser.openBrowserAsync(sourceUrl);

  const {novels: library} = useLibrary();

  const novelInLibrary = (novelUrl: string) =>
    library.some(
      novel => novel.novelUrl === novelUrl && novel.sourceId === sourceId,
    );

  return (
    <Container>
      <Searchbar
        searchText={searchText}
        leftIcon="magnify"
        placeholder={`Search ${sourceName}`}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={handleClearSearchbar}
        handleBackAction={goBack}
        rightIcons={[{iconName: 'earth', onPress: handleOpenWebView}]}
        theme={theme}
      />
      {isLoading || isSearching ? (
        <LoadingScreen theme={theme} />
      ) : error || searchError ? (
        <ErrorScreen error={error || searchError} theme={theme} />
      ) : (
        <NovelList
          data={novelList}
          keyExtractor={item => item.novelUrl}
          renderItem={({item}) => (
            <NovelCover
              item={item}
              theme={theme}
              showInLibraryBadge={novelInLibrary(item.novelUrl)}
              onPress={() =>
                navigate('NovelScreen' as never, {...item} as never)
              }
            />
          )}
          onEndReached={() => hasNextPage && !searchText && fetchNextPage()}
          ListFooterComponent={
            <>
              {hasNextPage && !searchText && (
                <LoadingMoreIndicator theme={theme} />
              )}
            </>
          }
        />
      )}
    </Container>
  );
};

export default BrowseSourceScreen;

const styles = StyleSheet.create({});
