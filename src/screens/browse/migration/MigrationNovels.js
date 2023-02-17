import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useTheme } from '@hooks/useTheme';

import EmptyView from '../../../components/EmptyView';
import MigrationNovelList from './MigrationNovelList';

import { ScreenContainer } from '../../../components/Common';
import { sourceManager } from '../../../sources/sourceManager';
import { useBrowseSettings, useSourcesReducer } from '../../../redux/hooks';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { Appbar } from '@components';
import GlobalSearchSkeletonLoading from '../loadingAnimation/GlobalSearchSkeletonLoading';

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
    color: theme.isDark ? '#F2B8B5' : '#B3261E',
  };

  const renderItem = ({ item }) => (
    <>
      <View style={{ padding: 8, paddingVertical: 16 }}>
        <Text style={{ color: theme.onSurface }}>{item.sourceName}</Text>
        <Text style={{ color: theme.onSurfaceVariant, fontSize: 12 }}>
          {item.lang}
        </Text>
      </View>
      {item.error ? (
        <Text style={[styles.error, colorError]}>{item.error}</Text>
      ) : item.loading ? (
        <GlobalSearchSkeletonLoading theme={theme} />
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
      <Appbar
        title={novelName}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      {progress > 0 && (
        <ProgressBar color={theme.primary} progress={progress} />
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
