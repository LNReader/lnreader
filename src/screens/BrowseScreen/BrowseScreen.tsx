import React, {memo, useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, useWindowDimensions, FlatList} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

import {useNavigation} from '@react-navigation/native';

import {Searchbar} from '../../components';
import SourceCard from './components/SourceCard/SourceCard';

import sourceList from '../../sources/sources.json';

import {useAppDispatch, useSourcesReducer, useTheme} from '../../redux/hooks';

import {Source} from '../../sources/types';
import {useSearch} from '../../hooks';
import {
  getSourcesAction,
  searchSourcesAction,
  setLastUsedSource,
  togglePinSource,
} from '../../redux/sources/sourcesSlice';

const SourcesTab = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {navigate} = useNavigation();

  const {allSources, pinnedSources, lastUsed} = useSourcesReducer();

  const isPinned = (sourceId: number) => pinnedSources.indexOf(sourceId) > -1;

  const handleOnTogglePinSource = (sourceId: number) =>
    dispatch(togglePinSource(sourceId));

  const lastUsedSource = sourceList.find(
    (source: Source) => source.id === lastUsed,
  );

  const renderItem = ({item}: {item: Source}) => {
    const pinnedStatus = isPinned(item.id);

    return (
      <SourceCard
        source={item}
        theme={theme}
        isPinned={pinnedStatus}
        onTogglePinSource={handleOnTogglePinSource}
        onPress={() => {
          navigate('BrowseSourceScreen' as never, {item} as never);
          dispatch(setLastUsedSource({sourceId: item.id}));
        }}
      />
    );
  };

  const pinnedSourceList = allSources.filter(source => isPinned(source.id));

  return (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={pinnedSourceList}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={
        lastUsedSource ? (
          <>
            {
              <>
                <Text
                  style={[styles.header, {color: theme.textColorSecondary}]}
                >
                  Last used
                </Text>
                <SourceCard
                  source={lastUsedSource}
                  theme={theme}
                  isPinned={isPinned(lastUsedSource.id)}
                  onTogglePinSource={handleOnTogglePinSource}
                  onPress={() => {
                    navigate(
                      'BrowseSourceScreen' as never,
                      {item: lastUsedSource} as never,
                    );
                    dispatch(setLastUsedSource({sourceId: lastUsedSource.id}));
                  }}
                />
              </>
            }
            {pinnedSourceList.length > 0 ? (
              <Text style={[styles.header, {color: theme.textColorSecondary}]}>
                Pinned
              </Text>
            ) : null}
          </>
        ) : null
      }
      renderItem={renderItem}
    />
  );
};

const AllTab = memo(() => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {navigate} = useNavigation();

  const {allSources, pinnedSources} = useSourcesReducer();

  const isPinned = (sourceId: number) => pinnedSources.indexOf(sourceId) > -1;

  const handleOnTogglePinSource = (sourceId: number) =>
    dispatch(togglePinSource(sourceId));

  const renderItem = ({item}: {item: Source}) => (
    <SourceCard
      source={item}
      theme={theme}
      isPinned={isPinned(item.id)}
      onTogglePinSource={handleOnTogglePinSource}
      onPress={() => {
        navigate('BrowseSourceScreen' as never, {item} as never);
        dispatch(setLastUsedSource({sourceId: item.id}));
      }}
    />
  );

  return (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={allSources}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      removeClippedSubviews
    />
  );
});

const BrowseScreen = () => {
  const {navigate} = useNavigation();
  const theme = useTheme();

  const dispatch = useAppDispatch();

  const {searchText, setSearchText, clearSearchbar} = useSearch();

  const onChangeText = (text: string) => {
    setSearchText(text);
    dispatch(searchSourcesAction(text));
  };

  const handleClearSearchbar = () => {
    clearSearchbar();
    dispatch(getSourcesAction());
  };

  const {languageFilters} = useSourcesReducer();

  useEffect(() => {
    dispatch(getSourcesAction());
  }, [dispatch, languageFilters]);

  const renderScene = SceneMap({
    first: SourcesTab,
    second: AllTab,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Sources'},
    {key: 'second', title: 'All'},
  ]);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: theme.primary}}
      style={[
        styles.tabBarStyle,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.divider,
        },
      ]}
      renderLabel={({route, color}) => (
        <Text style={{color}}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.primary}
      pressColor={theme.rippleColor}
    />
  );

  return (
    <>
      <Searchbar
        searchText={searchText}
        placeholder="Search sources"
        leftIcon="magnify"
        onChangeText={onChangeText}
        clearSearchbar={handleClearSearchbar}
        theme={theme}
        rightIcons={[
          {
            iconName: 'cog-outline',
            onPress: () => navigate('SettingsBrowse' as never),
          },
        ]}
      />
      <TabView
        lazy
        navigationState={{index, routes}}
        renderTabBar={renderTabBar}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
      />
    </>
  );
};

export default BrowseScreen;

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabBarStyle: {
    elevation: 0,
    borderBottomWidth: 1,
  },
});
