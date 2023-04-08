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

import EmptyView from '@components/EmptyView';
import MigrationNovelList from './MigrationNovelList';

import { ScreenContainer } from '@components/Common';
import { getPlugin } from '@plugins/pluginManager';
import { useBrowseSettings, usePluginReducer } from '@redux/hooks';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { Appbar } from '@components';
import GlobalSearchSkeletonLoading from '../loadingAnimation/GlobalSearchSkeletonLoading';

const MigrationNovels = ({ navigation, route }) => {
  const { pluginId, novel } = route.params;

  const theme = useTheme();

  const isMounted = React.useRef(true);

  const [progress, setProgress] = useState(0);
  const [searchResults, setSearchResults] = useState('');

  const { library } = useLibraryNovels();

  const { installedPlugins, pinnedPlugins } = usePluginReducer();

  const isPinned = id => pinnedPlugins.find(plg => plg.id !== id);

  const { searchAllSources = false } = useBrowseSettings();

  const getSearchResults = async () => {
    let migrationSources = searchAllSources ? installedPlugins : pinnedPlugins;

    setSearchResults(
      migrationSources.map(item => ({
        id: item.id,
        name: item.name,
        lang: item.lang,
        loading: true,
        novels: [],
        error: null,
      })),
    );

    migrationSources.map(async item => {
      if (isMounted.current === true) {
        try {
          const source = getPlugin(item.id);
          const data = await source.searchNovels(novel.name);
          setSearchResults(prevState =>
            prevState.map(pluginItem =>
              pluginItem.id === item.id
                ? { ...pluginItem, novels: data, loading: false }
                : { ...pluginItem },
            ),
          );
        } catch (e) {
          setSearchResults(prevState =>
            prevState.map(pluginItem =>
              pluginItem.id === item.id
                ? {
                    ...pluginItem,
                    loading: false,
                    error: e.message,
                  }
                : pluginItem,
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
        <Text style={{ color: theme.onSurface }}>{item.name}</Text>
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
          data={item}
          fromNovel={novel} // the novel will be migrated from
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
        title={novel.name}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      {progress > 0 && (
        <ProgressBar color={theme.primary} progress={progress} />
      )}
      <FlatList
        contentContainerStyle={{ flexGrow: 1, padding: 4 }}
        data={searchResults}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        extraData={pinnedPlugins}
        ListEmptyComponent={
          <EmptyView
            icon="__φ(．．)"
            description={`Search a novel in your pinned plugins ${
              pinnedPlugins.length === 0 ? '(No plugins pinned)' : ''
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
