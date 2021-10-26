import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import {useDispatch} from 'react-redux';

import {useTheme, useLibrary, useSettings} from '../../hooks/reduxHooks';
import {setAppSettings} from '../../redux/settings/settings.actions';
import {getSource} from '../../sources/sources';
import {showToast} from '../../hooks/showToast';

import {Searchbar} from '../../components/Searchbar/Searchbar';
import {LoadingScreen} from '../../components/LoadingScreen/LoadingScreen';
import NovelCover from '../../components/NovelCover';
import NovelList from '../../components/NovelList';
import {ErrorView} from '../../components/ErrorView/ErrorView';

const SourceScreen = ({navigation, route}) => {
  const {sourceId, sourceName, url} = route.params;

  const theme = useTheme();
  const library = useLibrary();

  const dispatch = useDispatch();

  const settings = useSettings();
  const {displayMode} = settings;

  const [loading, setLoading] = useState(true);
  const [novels, setNovels] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState();
  const [totalPages, setTotalPages] = useState(1);

  const [searchText, setSearchText] = useState('');

  const incrementPage = () => setPage(prevState => prevState + 1);

  const clearSearchbar = () => {
    setNovels([]);
    setPage(1);
    setLoading(true);
    setSearchText('');
  };

  const isMounted = useRef(true);

  const getNovels = async () => {
    if (isMounted.current === true) {
      try {
        if (page <= totalPages) {
          const source = getSource(sourceId);
          const res = await source.popularNovels(page);
          setNovels(prevState => [...prevState, ...res.novels]);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      } catch (e) {
        setError(e.message);
        showToast(e.message);
        setNovels([]);
        setLoading(false);
      }
    }
  };

  const getSearchResults = async () => {
    try {
      setLoading(true);
      const source = getSource(sourceId);
      const res = await source.searchNovels(searchText);
      setNovels(res);
      setLoading(false);
    } catch (e) {
      setError(e.message);
      showToast(e.message);
      setNovels([]);
      setLoading(false);
    }
  };

  const checkIFInLibrary = (novelSourceId, novelUrl) =>
    library.some(
      obj => obj.novelUrl === novelUrl && obj.sourceId === novelSourceId,
    );

  useEffect(() => {
    getNovels();

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getNextPage = () => {
    if (!searchText) {
      incrementPage();
    }
  };

  const renderItem = ({item}) => (
    <NovelCover
      item={item}
      onPress={() =>
        navigation.navigate('Novel', {
          novelName: item.novelName,
          novelCover: item.novelCover,
          novelUrl: item.novelUrl,
          sourceId,
        })
      }
      libraryStatus={checkIFInLibrary(item.sourceId, item.novelUrl)}
      theme={theme}
    />
  );

  const listEmptyComponent = () => (
    <ErrorView
      errorName={error || 'No results found'}
      actions={[
        {
          name: 'Retry',
          onPress: () => {
            getNovels();
            setLoading(true);
            setError();
          },
          icon: 'reload',
        },
      ]}
      theme={theme}
    />
  );

  const displayMenuIcon = () => {
    const icons = {
      0: 'view-module',
      1: 'view-list',
      2: 'view-module',
    };

    return icons[displayMode];
  };

  const getNextDisplayMode = () =>
    displayMode === 0 ? 1 : displayMode === 1 ? 2 : displayMode === 2 && 0;

  return (
    <View style={[styles.container, {backgroundColor: theme.colorPrimaryDark}]}>
      <Searchbar
        theme={theme}
        placeholder={`Search ${sourceName}`}
        backAction="arrow-left"
        onBackAction={() => navigation.goBack()}
        searchText={searchText}
        onChangeText={text => setSearchText(text)}
        onSubmitEditing={getSearchResults}
        clearSearchbar={clearSearchbar}
        actions={[
          {
            icon: displayMenuIcon(),
            onPress: () =>
              dispatch(setAppSettings('displayMode', getNextDisplayMode())),
          },
          {
            icon: 'earth',
            onPress: () => WebBrowser.openBrowserAsync(url),
          },
        ]}
      />

      {loading ? (
        <LoadingScreen theme={theme} />
      ) : (
        <NovelList
          data={novels}
          renderItem={renderItem}
          ListEmptyComponent={listEmptyComponent()}
          onEndReached={getNextPage}
          ListFooterComponent={
            !searchText &&
            page < totalPages &&
            novels.length && (
              <View style={{paddingVertical: 16}}>
                <ActivityIndicator color={theme.colorAccent} />
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default SourceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});
