import React, {useEffect, useState} from 'react';
import {
  /* StyleSheet, */
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {ProgressBar} from 'react-native-paper';
import {useLibrary, useSettings, useTheme} from '../../../hooks/reduxHooks';
import {useSelector} from 'react-redux';

import EmptyView from '../../../components/EmptyView';
import MigrationNovelList from './MigrationNovelList';
import {Appbar} from '../../../components/Appbar';

import {showToast} from '../../../hooks/showToast';
import {ScreenContainer} from '../../../components/Common';
import {getSource} from '../../../sources/sources';

const MigrationNovels = ({navigation, route}) => {
  const {sourceId, novelName} = route.params;
  const theme = useTheme();

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState('');
  const {searchAllSources = false} = useSettings();
  let {
    sources,
    pinned,
    filters = [],
  } = useSelector(state => state.sourceReducer);
  sources = sources.filter(source => filters.indexOf(source.lang) === -1);

  const library = useLibrary();

  const pinnedSources = sources.filter(
    source =>
      pinned.indexOf(source.sourceId) !== -1 && source.sourceId !== sourceId,
  );

  const getSearchResults = async () => {
    let migrationSources = searchAllSources ? sources : pinnedSources;
    for (let i = 0; i < migrationSources.length; i++) {
      try {
        setLoading(true);

        const source = getSource(migrationSources[i].sourceId);
        const data = await source.searchNovels(novelName);

        setSearchResults(before => [
          ...before,
          {
            sourceId: migrationSources[i].sourceId,
            sourceName: migrationSources[i].sourceName,
            sourceLanguage: migrationSources[i].lang,
            novels: data,
          },
        ]);
        setLoading(false);
      } catch (error) {
        showToast(error.message);

        setSearchResults(before => [
          ...before,
          {
            sourceId: migrationSources[i].sourceId,
            sourceName: migrationSources[i].sourceName,
            sourceLanguage: migrationSources[i].lang,
            novels: [],
          },
        ]);
        setLoading(false);
      }
      setProgress(before => before + 1 / migrationSources.length);
    }
  };

  useEffect(() => {
    getSearchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({item}) => (
    <>
      <View style={{padding: 8, paddingVertical: 16}}>
        <Text style={{color: theme.textColorPrimary}}>{item.sourceName}</Text>
        <Text style={{color: theme.textColorSecondary, fontSize: 12}}>
          {item.sourceLanguage}
        </Text>
      </View>
      <MigrationNovelList
        data={item.novels}
        theme={theme}
        library={library}
        navigation={navigation}
      />
    </>
  );

  return (
    <ScreenContainer theme={theme}>
      <Appbar title={novelName} onBackAction={() => navigation.goBack()} />
      {progress > 0 && (
        <ProgressBar color={theme.colorAccent} progress={progress} />
      )}
      <FlatList
        contentContainerStyle={{
          flexGrow: 1,
          padding: 4,
        }}
        data={searchResults}
        keyExtractor={item => item.sourceId.toString()}
        renderItem={renderItem}
        extraData={pinned}
        ListEmptyComponent={
          <>
            {!loading && (
              <EmptyView
                icon="__φ(．．)"
                description={`Search a novel in your pinned sources ${
                  pinned.length === 0 ? '(No sources pinned)' : ''
                }`}
              />
            )}
          </>
        }
        ListFooterComponent={
          loading && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <ActivityIndicator size="large" color={theme.colorAccent} />
            </View>
          )
        }
      />
    </ScreenContainer>
  );
};

export default MigrationNovels;

// const styles = StyleSheet.create({});
