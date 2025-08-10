import React, { useCallback, useRef, useState } from 'react';

import { FAB, Portal } from 'react-native-paper';
import { ErrorScreenV2, SafeAreaView, SearchbarV2 } from '@components/index';
import NovelList from '@components/NovelList';
import NovelCover from '@components/NovelCover';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import FilterBottomSheet from './components/FilterBottomSheet';

import { useSearch } from '@hooks';
import { useTheme } from '@providers/ThemeProvider';
import { useBrowseSource, useSearchSource } from './useBrowseSource';

import { NovelItem } from '@plugins/types';
import { getString } from '@strings/translations';
import { StyleSheet, Text } from 'react-native';
import { NovelInfo } from '@database/types';
import SourceScreenSkeletonLoading from '@screens/browse/loadingAnimation/SourceScreenSkeletonLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseSourceScreenProps } from '@navigators/types';
import { useLibraryContext } from '@components/Context/LibraryContext';
import KeyboardAvoidingModal from '@components/Modal/KeyboardAvoidingModal';
import TextInput from '@components/TextInput/TextInput';

const BrowseSourceScreen = ({ route, navigation }: BrowseSourceScreenProps) => {
  const theme = useTheme();
  const { pluginId, pluginName, site, showLatestNovels } = route.params;

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
    searchNextPage,
    hasNextSearchPage,
    clearSearchResults,
    searchError,
  } = useSearchSource(pluginId);
  const novelList = searchResults.length > 0 ? searchResults : novels;
  const errorMessage = error || searchError;

  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => {
    searchSource(searchText);
  };
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  const handleDirectNovelOpen = () => {
    setShowDirectOpenModal(true);
  };

  const handleOpenWebView = async () => {
    navigation.navigate('WebviewScreen', {
      name: pluginName,
      url: site,
      pluginId,
    });
  };

  const { novelInLibrary, switchNovelToLibrary } = useLibraryContext();
  const [inActivity, setInActivity] = useState<Record<string, boolean>>({});
  const [showDirectOpenModal, setShowDirectOpenModal] = useState(false);
  const [directUrl, setDirectUrl] = useState('');

  const navigateToNovel = useCallback(
    (item: NovelItem | NovelInfo) => {
      console.log('item', item);
      navigation.navigate('ReaderStack', {
        screen: 'Novel',
        params: {
          ...item,
          pluginId: pluginId,
        },
      });
    },
    [navigation, pluginId],
  );

  const { bottom, right } = useSafeAreaInsets();
  const filterSheetRef = useRef<BottomSheetModal | null>(null);
  return (
    <SafeAreaView>
      <SearchbarV2
        searchText={searchText}
        leftIcon="magnify"
        placeholder={`${getString('common.search')} ${pluginName}`}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={handleClearSearchbar}
        handleBackAction={navigation.goBack}
        rightIcons={[
          { iconName: 'earth', onPress: handleOpenWebView },
          {
            iconName: 'link',
            onPress: handleDirectNovelOpen,
          },
        ]}
        theme={theme}
      />
      {isLoading || isSearching ? (
        <SourceScreenSkeletonLoading theme={theme} />
      ) : errorMessage || novelList.length === 0 ? (
        <ErrorScreenV2
          error={errorMessage || getString('sourceScreen.noResultsFound')}
          actions={[
            {
              iconName: 'refresh',
              title: getString('common.retry'),
              onPress: () => {
                if (searchText) {
                  searchSource(searchText);
                } else {
                  refetchNovels();
                }
              },
            },
          ]}
        />
      ) : (
        <NovelList
          data={novelList}
          inSource
          renderItem={({ item }) => {
            const inLibrary = novelInLibrary(pluginId, item.path);

            return (
              <NovelCover
                item={item}
                theme={theme}
                libraryStatus={inLibrary}
                inActivity={inActivity[item.path]}
                onPress={() => navigateToNovel(item)}
                isSelected={false}
                addSkeletonLoading={
                  (hasNextPage && !searchText) ||
                  (hasNextSearchPage && Boolean(searchText))
                }
                onLongPress={async () => {
                  setInActivity(prev => ({ ...prev, [item.path]: true }));

                  await switchNovelToLibrary(item.path, pluginId);

                  setInActivity(prev => ({ ...prev, [item.path]: false }));
                }}
                selectedNovelIds={[]}
              />
            );
          }}
          onEndReached={() => {
            if (searchText) {
              if (hasNextSearchPage) {
                searchNextPage();
              }
            } else if (hasNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={1.5}
        />
      )}
      {!showLatestNovels && filterValues && !searchText ? (
        <>
          <FAB
            icon={'filter-variant'}
            style={[
              styles.filterFab,
              {
                backgroundColor: theme.primary,
                marginBottom: bottom + 16,
                marginRight: right + 16,
              },
            ]}
            label={getString('common.filter')}
            uppercase={false}
            color={theme.onPrimary}
            onPress={() => filterSheetRef?.current?.present()}
          />
          <FilterBottomSheet
            filterSheetRef={filterSheetRef}
            filters={filterValues}
            setFilters={setFilters}
            clearFilters={clearFilters}
          />
        </>
      ) : null}

      {/* Direct Open Modal */}
      <Portal>
        <KeyboardAvoidingModal
          visible={showDirectOpenModal}
          onDismiss={() => setShowDirectOpenModal(false)}
          onCancel={() => {
            setShowDirectOpenModal(false);
            setDirectUrl('');
          }} // @ts-ignore
          onSave={() => navigateToNovel({ path: directUrl, name: directUrl })}
          title={getString('browseSourceScreen.directOpen.title')}
        >
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {getString('browseSourceScreen.directOpen.title')}
          </Text>
          <Text
            style={[styles.modalDescription, { color: theme.onSurfaceVariant }]}
          >
            {getString('browseSourceScreen.directOpen.message')}
          </Text>
          <TextInput
            placeholder={`${pluginName} novel URL or path`}
            defaultValue={directUrl}
            onChangeText={setDirectUrl}
            style={styles.textInput}
            autoFocus
          />
        </KeyboardAvoidingModal>
      </Portal>
    </SafeAreaView>
  );
};

export default BrowseSourceScreen;

const styles = StyleSheet.create({
  filterFab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
