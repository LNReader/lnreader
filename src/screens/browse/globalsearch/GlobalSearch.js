import React, {useEffect, useRef, useState} from 'react';
import {FlatList} from 'react-native';

import {ProgressBar} from 'react-native-paper';
import {useSelector} from 'react-redux';

import {Searchbar} from '../../../components/Searchbar/Searchbar';
import EmptyView from '../../../components/EmptyView';

import {ScreenContainer} from '../../../components/Common';
import GlobalSearchSourceItem from './GlobalSearchSourceItem';

import {useLibrary, useSettings, useTheme} from '../../../hooks/reduxHooks';
import {getSource} from '../../../sources/sources';

const GlobalSearch = ({route, navigation}) => {
  const theme = useTheme();

  let novelName = '';
  if (route.params) {
    novelName = route.params.novelName;
  }

  let {
    sources,
    pinned,
    filters = [],
  } = useSelector(state => state.sourceReducer);
  sources = sources.filter(source => filters.indexOf(source.lang) === -1);

  const pinnedSources = sources.filter(
    source => pinned.indexOf(source.sourceId) !== -1,
  );
  const {searchAllSources = false} = useSettings();

  const [searchText, setSearchText] = useState(novelName);
  const [searchResults, setSearchResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const library = useLibrary();

  const isMounted = useRef(true);

  useEffect(() => {
    if (novelName) {
      onSubmitEditing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const clearSearchbar = () => setSearchText('');
  const onChangeText = text => setSearchText(text);

  const onSubmitEditing = async () => {
    setProgress(0);

    let globalSearchSources = searchAllSources ? sources : pinnedSources;

    setSearchResults(
      globalSearchSources.map(item => ({
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        lang: item.lang,
        loading: true,
        novels: [],
        error: null,
      })),
    );

    globalSearchSources.map(async item => {
      if (isMounted.current === true) {
        try {
          const source = getSource(item.sourceId);
          const data = await source.searchNovels(encodeURI(searchText));

          setSearchResults(prevState =>
            prevState.map(sourceItem =>
              sourceItem.sourceId === item.sourceId
                ? {...sourceItem, novels: data, loading: false}
                : {...sourceItem},
            ),
          );
        } catch (e) {
          setSearchResults(prevState =>
            prevState.map(sourceItem =>
              sourceItem.sourceId === item.sourceId
                ? {
                    ...sourceItem,
                    loading: false,
                    error: e.message,
                  }
                : sourceItem,
            ),
          );
        }

        setProgress(before => before + 1 / globalSearchSources.length);
      }
    });
  };

  const renderItem = ({item}) => (
    <GlobalSearchSourceItem
      source={item}
      library={library}
      theme={theme}
      navigation={navigation}
    />
  );

  return (
    <ScreenContainer theme={theme}>
      <Searchbar
        theme={theme}
        placeholder="Global Search"
        backAction="arrow-left"
        onBackAction={navigation.goBack}
        searchText={searchText}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={clearSearchbar}
      />
      {progress > 0 && (
        <ProgressBar color={theme.colorAccent} progress={progress} />
      )}
      <FlatList
        contentContainerStyle={{flexGrow: 1, padding: 4}}
        data={searchResults}
        keyExtractor={item => item.sourceId.toString()}
        renderItem={renderItem}
        extraData={pinned}
        ListEmptyComponent={
          <EmptyView
            icon="__φ(．．)"
            description={`Search a novel in ${
              searchAllSources
                ? 'all sources'
                : pinned.length === 0
                ? 'pinned sources\n(No sources pinned)'
                : 'pinned sources'
            }`}
          />
        }
      />
    </ScreenContainer>
  );
};

export default GlobalSearch;
