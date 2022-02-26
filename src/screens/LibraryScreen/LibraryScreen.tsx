import React, {useRef} from 'react';
import {StyleSheet, RefreshControl} from 'react-native';
import {Portal} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {
  ErrorScreen,
  LoadingScreen,
  NovelCover,
  NovelList,
  Searchbar,
  EmptyView,
  Actionbar,
} from '../../components';
import LibraryBottomSheet from './components/LibraryBottomSheet/LibraryBottomSheet';

import useLibrary from './hooks/useLibrary';
import {useLibrarySettings, useTheme} from '../../redux/hooks';
import {useSearch} from '../../hooks';
import useLibraryUpdate from '../UpdatesScreen/hooks/useLibraryUpdate';
import {getFilterColor} from '../../theme/utils/colorUtils';
import useSelectNovels from './hooks/useSelectNovels';
import {LibraryNovelInfo} from '../../database/types';
import {
  updateAllChapterReadInDb,
  updateAllChapterUnreadInDb,
} from '../../database/queries/ChapterQueries';
import {unfollowNovelInDb} from '../../database/queries/NovelQueries';

const LibraryScreen = () => {
  const theme = useTheme();
  const {navigate} = useNavigation();

  const {
    isLoading,
    novels,
    getLibrarySearchResults,
    clearSearchResults,
    getLibraryNovels,
    error,
  } = useLibrary();

  const {filters} = useLibrarySettings();

  const {isUpdating, updateLibrary} = useLibraryUpdate();

  const {selectedNovels, selectNovel, isSelected, clearSelection} =
    useSelectNovels();

  let bottomSheetRef = useRef<any>(null);
  const expandBottomSheet = () => bottomSheetRef.current.show();

  const {searchText, setSearchText, clearSearchbar} = useSearch();
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  const onChangeText = (text: string) => {
    setSearchText(text);
    getLibrarySearchResults(text);
  };

  return isLoading ? (
    <LoadingScreen theme={theme} />
  ) : error ? (
    <ErrorScreen error={error} theme={theme} />
  ) : (
    <>
      <Searchbar
        searchText={searchText}
        placeholder={
          selectedNovels.length > 0
            ? `${selectedNovels.length} selected`
            : 'Search library'
        }
        leftIcon={selectedNovels.length > 0 ? 'close' : 'magnify'}
        onLeftIconPress={() => {
          if (selectedNovels.length > 0) {
            clearSelection();
          }
        }}
        onChangeText={onChangeText}
        clearSearchbar={handleClearSearchbar}
        rightIcons={[
          {
            iconName: 'filter-variant',
            onPress: expandBottomSheet,
            color:
              filters.length > 0
                ? getFilterColor(theme)
                : theme.textColorPrimary,
          },
        ]}
        theme={theme}
      />
      <NovelList
        data={novels}
        keyExtractor={item => `${item.novelUrl}${item.sourceId}`}
        renderItem={({item}) =>
          'novelId' in item ? (
            <NovelCover
              item={item}
              theme={theme}
              onPress={() => {
                if (selectedNovels.length) {
                  selectNovel(item.novelId);
                } else {
                  navigate('NovelScreen' as never, {...item} as never);
                }
              }}
              onLongPress={() => selectNovel(item.novelId)}
              isSelected={isSelected(item.novelId)}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyView
            icon="Σ(ಠ_ಠ)"
            description="Your library is empty. Add series to your library from Browse."
            theme={theme}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isUpdating}
            onRefresh={updateLibrary}
            colors={[theme.onPrimary]}
            progressBackgroundColor={theme.primary}
          />
        }
      />
      <Portal>
        {selectedNovels.length ? (
          <Actionbar
            visible={selectedNovels.length > 0}
            actions={[
              {
                icon: 'check',
                onPress: () => {
                  selectedNovels.map(id => updateAllChapterReadInDb(id));
                  clearSelection();
                  getLibraryNovels();
                },
              },
              {
                icon: 'check-outline',
                onPress: () => {
                  selectedNovels.map(id => updateAllChapterUnreadInDb(id));
                  clearSelection();
                  getLibraryNovels();
                },
              },
              {
                icon: 'delete-outline',
                onPress: () => {
                  selectedNovels.map(id => unfollowNovelInDb(id));
                  clearSelection();
                  getLibraryNovels();
                },
              },
            ]}
            theme={theme}
          />
        ) : null}
        <LibraryBottomSheet bottomSheetRef={bottomSheetRef} theme={theme} />
      </Portal>
    </>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({});
