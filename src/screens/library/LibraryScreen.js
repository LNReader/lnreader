import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';

import { Searchbar } from '../../components/Searchbar/Searchbar';
import NovelList from '../../components/NovelList';
import NovelCover from '../../components/NovelCover';
import EmptyView from '../../components/EmptyView';

import {
  getLibraryAction,
  searchLibraryAction,
} from '../../redux/library/library.actions';
import { updateLibraryAction } from '../../redux/updates/updates.actions';
import { useSettings, useTheme } from '../../hooks/reduxHooks';
import { setNovel } from '../../redux/novel/novel.actions';
import { Portal } from 'react-native-paper';
import LibraryBottomSheet from './components/LibraryBottomSheet';
import { Actionbar } from '../../components/Actionbar/Actionbar';
import {
  markAllChaptersRead,
  markAllChaptersUnread,
} from '../../database/queries/ChapterQueries';
import { unfollowNovel } from '../../database/queries/NovelQueries';
import { Banner } from './components/Banner';
import { getString } from '../../../strings/translations';

const LibraryScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const {
    showNumberOfNovels,
    incognitoMode = false,
    updateLibraryOnLaunch = false,
    downloadedOnlyMode = false,
  } = useSettings();

  const bottomSheetRef = useRef(null);

  const {
    loading,
    novels,
    filters: { sort, filter },
  } = useSelector(state => state.libraryReducer);

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  useFocusEffect(
    useCallback(() => {
      setSearchText('');
      dispatch(getLibraryAction(sort, filter));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getLibraryAction, sort, filter]),
  );

  useEffect(() => {
    updateLibraryOnLaunch && dispatch(updateLibraryAction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(updateLibraryAction());
    setRefreshing(false);
  };

  const clearSearchbar = () => {
    dispatch(getLibraryAction(sort, filter));
    setSearchText('');
  };

  const onChangeText = text => {
    setSearchText(text);
    dispatch(searchLibraryAction(text, sort, filter));
  };

  /**
   * Selected Novels
   */

  const [selectedNovels, setSelectedNovels] = useState([]);

  const selectNovel = novelId => {
    if (selectedNovels.indexOf(novelId) === -1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedNovels(prevState => [...prevState, novelId]);
    } else {
      setSelectedNovels(prevState => prevState.filter(id => id !== novelId));
    }
  };

  const renderItem = ({ item }) => (
    <NovelCover
      item={item}
      onPress={() => {
        navigation.navigate('Novel', item);
        dispatch(setNovel(item));
      }}
      theme={theme}
      onLongPress={selectNovel}
      isSelected={selectedNovels.indexOf(item.novelId) === -1 ? false : true}
      selectedNovels={selectedNovels}
    />
  );

  const refreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['white']}
      progressBackgroundColor={theme.colorAccent}
    />
  );

  const listEmptyComponent = () =>
    searchText === '' && (
      <EmptyView icon="Σ(ಠ_ಠ)" description={getString('libraryScreen.empty')} />
    );

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.colorPrimaryDark }]}
      >
        <Searchbar
          placeholder={
            selectedNovels.length === 0
              ? `${getString('libraryScreen.searchbar')} ${
                  showNumberOfNovels ? '(' + novels.length + ')' : ''
                }`
              : `${selectedNovels.length} selected`
          }
          searchText={searchText}
          clearSearchbar={clearSearchbar}
          onChangeText={onChangeText}
          backAction={selectedNovels.length > 0 ? 'close' : 'magnify'}
          onBackAction={() =>
            selectedNovels.length > 0 && setSelectedNovels([])
          }
          actions={[
            {
              icon: 'filter-variant',
              onPress: () => bottomSheetRef.current.show(),
              color:
                filter || downloadedOnlyMode
                  ? theme.filterColor
                  : theme.textColorPrimary,
            },
          ]}
          theme={theme}
        />

        {downloadedOnlyMode && (
          <Banner
            icon="cloud-off-outline"
            label="Downloaded only"
            theme={theme}
          />
        )}
        {incognitoMode && (
          <Banner
            icon="incognito"
            label="Incognito mode"
            theme={theme}
            backgroundColor={theme.colorAccent}
          />
        )}
        {loading ? (
          <ActivityIndicator size="small" color={theme.colorAccent} />
        ) : (
          <>
            {searchText !== '' && (
              <View style={styles.globalSearch}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('GlobalSearchScreen', {
                      searchText,
                    })
                  }
                  android_ripple={{ color: theme.rippleColor }}
                  style={styles.globalSearchBtn}
                >
                  <Text style={{ color: theme.colorAccent }}>
                    {`Search for "${searchText}" globally`}
                  </Text>
                </Pressable>
              </View>
            )}
            <NovelList
              data={novels}
              renderItem={renderItem}
              refreshControl={refreshControl()}
              ListEmptyComponent={listEmptyComponent}
            />
            <Actionbar
              active={selectedNovels.length > 0}
              theme={theme}
              actions={[
                {
                  icon: 'check',
                  onPress: () => {
                    selectedNovels.map(id => markAllChaptersRead(id));
                    setSelectedNovels([]);
                    dispatch(getLibraryAction(sort, filter));
                  },
                },
                {
                  icon: 'check-outline',
                  onPress: () => {
                    selectedNovels.map(id => markAllChaptersUnread(id));
                    setSelectedNovels([]);
                    dispatch(getLibraryAction(sort, filter));
                  },
                },
                {
                  icon: 'delete-outline',
                  onPress: () => {
                    selectedNovels.map(id => unfollowNovel(id));
                    setSelectedNovels([]);
                    dispatch(getLibraryAction(sort, filter));
                  },
                },
              ]}
            />
            <Portal>
              <LibraryBottomSheet
                bottomSheetRef={bottomSheetRef}
                dispatch={dispatch}
                sort={sort}
                filter={filter}
                theme={theme}
                downloadedOnlyMode={downloadedOnlyMode}
              />
            </Portal>
          </>
        )}
      </View>
    </>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  globalSearch: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 50,
    overflow: 'hidden',
  },
  globalSearchBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
