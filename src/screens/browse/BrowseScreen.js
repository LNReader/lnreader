import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {
  getSourcesAction,
  searchSourcesAction,
} from '../../redux/source/source.actions';
import {useSettings, useTheme} from '../../hooks/reduxHooks';
import {showToast} from '../../hooks/showToast';

import {Searchbar} from '../../components/Searchbar/Searchbar';
import SourceItem from './components/SourceItem';
import EmptyView from '../../components/EmptyView';
import DiscoverCard from './discover/DiscoverCard';

const Browse = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  let {
    sources,
    search,
    loading,
    pinned,
    filters = [],
    showMyAnimeList = true,
  } = useSelector(state => state.sourceReducer);

  const {onlyShowPinnedSources = false} = useSettings();

  const theme = useTheme();
  const dispatch = useDispatch();

  const isPinned = sourceId => (pinned.indexOf(sourceId) === -1 ? false : true);

  sources = sources.filter(source => filters.indexOf(source.lang) === -1);
  search = search.filter(source => filters.indexOf(source.lang) === -1);

  let pinnedSources = sources.filter(source => isPinned(source.sourceId));

  useEffect(() => {
    dispatch(getSourcesAction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    showToast('Updating extension list');
    setRefreshing(true);
    getSourcesAction();
    setRefreshing(false);
  };

  const clearSearchbar = () => {
    setSearchText('');
  };

  const onChangeText = text => {
    setSearchText(text);
    dispatch(searchSourcesAction(text));
  };

  const renderItem = ({item}) => (
    <SourceItem
      item={item}
      isPinned={isPinned(item.sourceId)}
      dispatch={dispatch}
      navigation={navigation}
      theme={theme}
    />
  );

  const Header = ({title}) => (
    <Text style={[styles.header, {color: theme.textColorSecondary}]}>
      {title}
    </Text>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colorPrimaryDark}]}>
      <Searchbar
        theme={theme}
        placeholder="Search Source"
        backAction="magnify"
        searchText={searchText}
        onChangeText={onChangeText}
        clearSearchbar={clearSearchbar}
        actions={[
          {
            icon: 'book-search',
            onPress: () => navigation.navigate('GlobalSearch'),
          },
          {
            icon: 'swap-vertical-variant',
            onPress: () => navigation.navigate('Migration'),
          },
          {
            icon: 'cog-outline',
            onPress: () => navigation.navigate('BrowseSettings'),
          },
        ]}
      />

      <FlatList
        contentContainerStyle={{flexGrow: 1, paddingBottom: 32}}
        data={onlyShowPinnedSources ? [] : !searchText ? sources : search}
        keyExtractor={item => item.sourceId.toString()}
        renderItem={renderItem}
        extraData={pinnedSources}
        ListHeaderComponent={
          <View>
            {showMyAnimeList && (
              <>
                <Header title="Discover" />
                {showMyAnimeList && (
                  <DiscoverCard
                    label="MyAnimeList"
                    onPress={() => navigation.navigate('BrowseMal')}
                    icon={require('../../../assets/mal.png')}
                    theme={theme}
                  />
                )}
              </>
            )}
            {pinnedSources.length > 0 && (
              <FlatList
                contentContainerStyle={{paddingBottom: 16}}
                data={pinnedSources}
                keyExtractor={item => item.sourceId.toString()}
                renderItem={renderItem}
                extraData={pinnedSources}
                ListHeaderComponent={<Header title="Pinned" />}
              />
            )}
            {sources.length > 0 && !onlyShowPinnedSources && (
              <Header title="Sources" />
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="small"
              color={theme.colorAccent}
              style={{marginTop: 16}}
            />
          ) : (
            sources.length === 0 && (
              <EmptyView
                icon="(･Д･。"
                description="Enable languages from settings"
              />
            )
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['white']}
            progressBackgroundColor={theme.colorAccent}
          />
        }
      />
    </View>
  );
};

export default Browse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
  },
});
