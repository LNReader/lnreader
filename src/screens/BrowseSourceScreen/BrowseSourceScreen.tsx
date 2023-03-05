import React, { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { FAB, Portal } from 'react-native-paper';
import { Container, ErrorScreenV2, SearchbarV2 } from '@components/index';
import NovelList from '@components/NovelList';
import NovelCover from '@components/NovelCover';
import Bottomsheet from '@gorhom/bottom-sheet';
import FilterBottomSheet from './components/FilterBottomSheet';

import { useCategorySettings, useSearch } from '../../hooks';
import { useTheme } from '@hooks/useTheme';
import { useBrowseSource, useSearchSource } from './useBrowseSource';

import { SourceNovelItem } from '../../sources/types';
import { getString } from '@strings/translations';
import { StyleSheet } from 'react-native';
import { useLibraryNovels } from '../../screens/library/hooks/useLibrary';
import { insertNovelInLibrary } from '../../database/queries/NovelQueriesV2';
import { LibraryNovelInfo } from '../../database/types';
import SourceScreenSkeletonLoading from '@screens/browse/loadingAnimation/SourceScreenSkeletonLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BrowseSourceScreenProps {
  route: {
    params: {
      sourceId: number;
      sourceName: string;
      url: string;
      showLatestNovels?: boolean;
    };
  };
}

const BrowseSourceScreen: React.FC<BrowseSourceScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { navigate, goBack } = useNavigation();

  const {
    sourceId,
    sourceName,
    url: sourceUrl,
    showLatestNovels,
  } = route.params;

  const {
    isLoading,
    novels,
    hasNextPage,
    fetchNextPage,
    error,
    filterValues,
    setFilters,
    clearFilters,
  } = useBrowseSource(sourceId, showLatestNovels);

  const { defaultCategoryId = 1 } = useCategorySettings();
  const {
    isSearching,
    searchResults,
    searchSource,
    clearSearchResults,
    searchError,
  } = useSearchSource(sourceId);

  const novelList = searchResults.length > 0 ? searchResults : novels;
  const errorMessage = error || searchError;

  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => searchSource(searchText);
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  const handleOpenWebView = async () => {
    navigate('WebviewScreen', {
      sourceId,
      name: sourceName,
      url: sourceUrl,
    });
  };

  const { library, setLibrary } = useLibraryNovels();

  const novelInLibrary = (novelUrl: string) =>
    library?.some(
      novel => novel.novelUrl === novelUrl && novel.sourceId === sourceId,
    );

  const navigateToNovel = useCallback(
    (item: SourceNovelItem) =>
      navigate(
        'Novel' as never,
        {
          ...item,
          sourceId: sourceId,
        } as never,
      ),
    [sourceId],
  );

  const { bottom } = useSafeAreaInsets();
  const filterSheetRef = useRef<Bottomsheet | null>(null);
  return (
    <Container>
      <SearchbarV2
        searchText={searchText}
        leftIcon="magnify"
        placeholder={`${getString('common.search')} ${sourceName}`}
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
            const inLibrary = novelInLibrary(item.novelUrl);

            return (
              <NovelCover
                item={item}
                theme={theme}
                libraryStatus={inLibrary}
                onPress={() => navigateToNovel(item)}
                onLongPress={() => {
                  setLibrary(prevValues => {
                    if (inLibrary) {
                      return [
                        ...prevValues.filter(
                          novel => novel.novelUrl !== item.novelUrl,
                        ),
                      ];
                    } else {
                      return [
                        ...prevValues,
                        {
                          novelUrl: item.novelUrl,
                          sourceId,
                        } as LibraryNovelInfo,
                      ];
                    }
                  });
                  insertNovelInLibrary(
                    sourceId,
                    item.novelUrl,
                    inLibrary,
                    defaultCategoryId,
                  );
                }}
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
            onPress={() => filterSheetRef?.current?.expand()}
          />
          <Portal>
            <FilterBottomSheet
              filterSheetRef={filterSheetRef}
              filtersValues={filterValues}
              setFilters={setFilters}
              clearFilters={clearFilters}
            />
          </Portal>
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
