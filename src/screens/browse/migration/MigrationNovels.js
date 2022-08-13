import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useSettings, useTheme } from '../../../hooks/reduxHooks';
import { useSelector } from 'react-redux';

import EmptyView from '../../../components/EmptyView';
import MigrationNovelList from './MigrationNovelList';
import { Appbar } from '../../../components/Appbar';

import { ScreenContainer } from '../../../components/Common';
import { sourceManager } from '../../../sources/sourceManager';
import { useBrowseSettings, useSourcesReducer } from '../../../redux/hooks';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';

const MigrationNovels = ({ navigation, route }) => {
  const { sourceId, novelName } = route.params;
  const theme = useTheme();

  const isMounted = React.useRef(true);

  const [progress, setProgress] = useState(0);
  const [searchResults, setSearchResults] = useState('');

  const { library } = useLibraryNovels();

  const { allSources, pinnedSourceIds = [] } = useSourcesReducer();

  const isPinned = id => pinnedSourceIds.indexOf(id) > -1;
  const pinnedSources = allSources.filter(source => isPinned(source.sourceId));

  const { searchAllSources = false } = useBrowseSettings();

  const getSearchResults = async () => {
    let migrationSources = searchAllSources ? allSources : pinnedSources;

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
          const source = sourceManager(item.sourceId);
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
        extraData={pinnedSources}
        ListEmptyComponent={
          <EmptyView
            icon="__φ(．．)"
            description={`Search a novel in your pinned sources ${
              pinnedSources.length === 0 ? '(No sources pinned)' : ''
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
