import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { FAB } from 'react-native-paper';
import { Container, ErrorScreenV2, SearchbarV2 } from '@components/index';
import NovelList from '@components/NovelList';
import NovelCover from '@components/NovelCover';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import FilterBottomSheet from './components/FilterBottomSheet';

import { usePreviousRouteName, useSearch } from '@hooks';
import { useTheme } from '@hooks/useTheme';
import { useBrowseSource, useSearchSource } from './useBrowseSource';

import { NovelItem } from '@plugins/types';
import { getString } from '@strings/translations';
import { StyleSheet } from 'react-native';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { switchNovelToLibrary } from '@database/queries/NovelQueries';
import { NovelInfo } from '@database/types';
import SourceScreenSkeletonLoading from '@screens/browse/loadingAnimation/SourceScreenSkeletonLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseSourceScreenProps } from '@navigators/types';

const BrowseSourceScreen = ({ route }: BrowseSourceScreenProps) => {
  const theme = useTheme();
  const { navigate, goBack } = useNavigation();
  const previousScreen = usePreviousRouteName();

  const { pluginId, pluginName, pluginUrl, showLatestNovels } = route.params;

  const {
    isLoading,
    novels,
    hasNextPage,
    fetchNextPage,
    error,
    filterValues,
    setFilters,
    clearFilters,
    refetchNovels,
  } = useBrowseSource(pluginId, showLatestNovels);

  const {
    isSearching,
    searchResults,
    searchSource,
    clearSearchResults,
    searchError,
  } = useSearchSource(pluginId);

  const novelList = searchResults.length > 0 ? searchResults : novels;
  const errorMessage = error || searchError;

  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => searchSource(searchText);
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  useEffect(() => {
    if (previousScreen === 'WebviewScreen') {
      refetchNovels();
    }
  }, [previousScreen]);

  const handleOpenWebView = async () => {
    navigate(
      'WebviewScreen' as never,
      {
        pluginId,
        name: pluginName,
        url: pluginUrl,
      } as never,
    );
  };

  const { library, setLibrary } = useLibraryNovels();

  const novelInLibrary = (novelUrl: string) =>
    library?.some(novel => novel.url === novelUrl);

  const navigateToNovel = useCallback(
    (item: NovelItem) =>
      navigate(
        'Novel' as never,
        {
          ...item,
          pluginId: pluginId,
        } as never,
      ),
    [pluginId],
  );

  const { bottom } = useSafeAreaInsets();
  const filterSheetRef = useRef<BottomSheetModal | null>(null);
  return (
    <Container>
      <SearchbarV2
        searchText={searchText}
        leftIcon="magnify"
        placeholder={`${getString('common.search')} ${pluginName}`}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={handleClearSearchbar}
        handleBackAction={goBack}
        rightIcons={[{ iconName: 'earth', onPress: handleOpenWebView }]}
        theme={theme}
      />
      {isLoading || isSearching ? (
        <SourceScreenSkeletonLoading theme={theme} />
      ) : errorMessage || novelList.length === 0 ? (
        <ErrorScreenV2
          error={errorMessage || getString('sourceScreen.noResultsFound')}
        />
      ) : (
        <NovelList
          data={novelList}
          renderItem={({ item }) => {
            const inLibrary = novelInLibrary(item.url);

            return (
              <NovelCover
                item={item}
                theme={theme}
                libraryStatus={inLibrary}
                onPress={() => navigateToNovel(item)}
                isSelected={false}
                onLongPress={async () => {
                  await switchNovelToLibrary(item.url, pluginId);
                  setLibrary(prevValues => {
                    if (inLibrary) {
                      return [
                        ...prevValues.filter(novel => novel.url !== item.url),
                      ];
                    } else {
                      return [
                        ...prevValues,
                        {
                          ...item,
                          inLibrary: 1,
                        } as NovelInfo,
                      ];
                    }
                  });
                }}
                selectedNovels={[]}
              />
            );
          }}
          onEndReached={() => {
            if (hasNextPage && !searchText) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={
            hasNextPage && !searchText ? (
              <SourceScreenSkeletonLoading theme={theme} />
            ) : undefined
          }
        />
      )}

      {!showLatestNovels && filterValues?.length ? (
        <>
          <FAB
            icon={'filter-variant'}
            style={[
              styles.filterFab,
              { backgroundColor: theme.primary, marginBottom: bottom },
            ]}
            label={'Filter'}
            uppercase={false}
            color={theme.onPrimary}
            onPress={() => filterSheetRef?.current?.present()}
          />
          <FilterBottomSheet
            filterSheetRef={filterSheetRef}
            filtersValues={filterValues}
            setFilters={setFilters}
            clearFilters={clearFilters}
          />
        </>
      ) : null}
    </Container>
  );
};

export default BrowseSourceScreen;

const styles = StyleSheet.create({
  filterFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
});
