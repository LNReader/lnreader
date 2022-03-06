import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useLibrary, useSettings, useTheme } from '../../../hooks/reduxHooks';
import { useSelector } from 'react-redux';

import EmptyView from '../../../components/EmptyView';
import MigrationNovelList from './MigrationNovelList';
import { Appbar } from '../../../components/Appbar';

import { ScreenContainer } from '../../../components/Common';
import { getSource } from '../../../sources/sources';

const MigrationNovels = ({ navigation, route }) => {
  const { sourceId, novelName } = route.params;
  const theme = useTheme();

  const isMounted = React.useRef(true);

  const [progress, setProgress] = useState(0);
  const [searchResults, setSearchResults] = useState('');
  const { searchAllSources = false } = useSettings();
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

    setSearchResults(
      migrationSources.map(item => ({
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        lang: item.lang,
        loading: true,
        novels: [],
        error: null,
      })),
    );

    migrationSources.map(async item => {
      if (isMounted.current === true) {
        try {
          const source = getSource(item.sourceId);
          const data = await source.searchNovels(novelName);

          setSearchResults(prevState =>
            prevState.map(sourceItem =>
              sourceItem.sourceId === item.sourceId
                ? { ...sourceItem, novels: data, loading: false }
                : { ...sourceItem },
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

        setProgress(before => before + 1 / migrationSources.length);
      }
    });
  };

  useEffect(() => {
    getSearchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const colorError = {
    color: theme.statusBar === 'dark-content' ? '#B3261E' : '#F2B8B5',
  };

  const renderItem = ({ item }) => (
    <>
      <View style={{ padding: 8, paddingVertical: 16 }}>
        <Text style={{ color: theme.textColorPrimary }}>{item.sourceName}</Text>
        <Text style={{ color: theme.textColorSecondary, fontSize: 12 }}>
          {item.lang}
        </Text>
      </View>
      {item.error ? (
        <Text style={[styles.error, colorError]}>{item.error}</Text>
      ) : item.loading ? (
        <ActivityIndicator
          color={theme.colorAccent}
          style={{ marginVertical: 16 }}
        />
      ) : (
        <MigrationNovelList
          data={item.novels}
          theme={theme}
          library={library}
          navigation={navigation}
        />
      )}
    </>
  );

  return (
    <ScreenContainer theme={theme}>
      <Appbar title={novelName} onBackAction={navigation.goBack} />
      {progress > 0 && (
        <ProgressBar color={theme.colorAccent} progress={progress} />
      )}
      <FlatList
        contentContainerStyle={{ flexGrow: 1, padding: 4 }}
        data={searchResults}
        keyExtractor={item => item.sourceId.toString()}
        renderItem={renderItem}
        extraData={pinned}
        ListEmptyComponent={
          <EmptyView
            icon="__φ(．．)"
            description={`Search a novel in your pinned sources ${
              pinned.length === 0 ? '(No sources pinned)' : ''
            }`}
          />
        }
      />
    </ScreenContainer>
  );
};

export default MigrationNovels;

const styles = StyleSheet.create({
  error: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
});
