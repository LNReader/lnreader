import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import * as Haptics from 'expo-haptics';

import {Searchbar} from '../../components/Searchbar/Searchbar';
import NovelList from '../../components/NovelList';
import NovelCover from '../../components/NovelCover';
import EmptyView from '../../components/EmptyView';

import {
  getLibraryAction,
  searchLibraryAction,
} from '../../redux/library/library.actions';
import {updateLibraryAction} from '../../redux/updates/updates.actions';
import {useSettings, useTheme} from '../../hooks/reduxHooks';
import {setNovel} from '../../redux/novel/novel.actions';
import {Portal} from 'react-native-paper';
import LibraryFilterSheet from './components/LibraryFilterSheet';
import {Actionbar} from '../../components/Actionbar/Actionbar';
import {
  markAllChaptersRead,
  markAllChaptersUnread,
} from '../../database/queries/ChapterQueries';
import {unfollowNovel} from '../../database/queries/NovelQueries';

const LibraryScreen = ({navigation}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const settings = useSettings();
  const {
    showNumberOfNovels,
    incognitoMode = false,
    updateLibraryOnLaunch = false,
    downloadedOnlyMode = false,
  } = settings;

  const libraryFilterSheetRef = useRef(null);

  const {
    loading,
    novels,
    filters: {sort, filter},
  } = useSelector(state => state.libraryReducer);

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  useFocusEffect(
    useCallback(() => {
      setSearchText('');
      dispatch(getLibraryAction(sort, filter));
    }, [getLibraryAction, sort, filter]),
  );

  useEffect(() => {
    updateLibraryOnLaunch && dispatch(updateLibraryAction());
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

  const renderItem = ({item}) => (
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
      <EmptyView
        icon="Σ(ಠ_ಠ)"
        description="Your library is empty. Add series to your library from Browse."
      />
    );

  return (
    <>
      <View
        style={[styles.container, {backgroundColor: theme.colorPrimaryDark}]}
      >
        <Searchbar
          placeholder={
            selectedNovels.length === 0
              ? `Search Library ${
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
              onPress: () => libraryFilterSheetRef.current.show(),
              color:
                filter || downloadedOnlyMode
                  ? theme.filterColor
                  : theme.textColorPrimary,
            },
          ]}
          theme={theme}
        />
        {incognitoMode && (
          <View
            style={{
              backgroundColor: theme.searchBarColor,
              paddingVertical: 6,
              alignItems: 'center',
              marginVertical: 8,
              elevation: 2,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="incognito"
              color={theme.textColorSecondary}
              size={18}
            />
            <Text
              style={{
                color: theme.textColorSecondary,
                marginLeft: 8,
              }}
            >
              Incognito mode
            </Text>
          </View>
        )}
        {downloadedOnlyMode && (
          <View
            style={{
              backgroundColor: theme.searchBarColor,
              paddingVertical: 6,
              alignItems: 'center',
              marginVertical: 4,
              elevation: 2,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="cloud-off-outline"
              color={theme.textColorSecondary}
              size={18}
            />
            <Text
              style={{
                color: theme.textColorSecondary,
                marginLeft: 8,
              }}
            >
              Downloaded only
            </Text>
          </View>
        )}
        {loading ? (
          <ActivityIndicator size="small" color={theme.colorAccent} />
        ) : (
          <>
            {searchText !== '' && (
              <Pressable
                onPress={() =>
                  navigation.navigate('GlobalSearch', {
                    novelName: searchText,
                  })
                }
                android_ripple={{color: theme.colorAccent}}
                style={styles.emptySearch}
              >
                <Text style={{color: theme.colorAccent}}>
                  {`Search for "${searchText}" globally`}
                </Text>
              </Pressable>
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
                    selectedNovels.map(id => markAllChaptersRead(id)),
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
              <LibraryFilterSheet
                bottomSheetRef={libraryFilterSheetRef}
                theme={theme}
                dispatch={dispatch}
                sort={sort}
                filter={filter}
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
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
  },
});
