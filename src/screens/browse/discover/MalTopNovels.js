import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';

import * as WebBrowser from 'expo-web-browser';

import { ErrorView } from '../../../components/ErrorView/ErrorView';
import { SearchbarV2 } from '@components';

import { showToast } from '../../../hooks/showToast';
import { scrapeSearchResults, scrapeTopNovels } from './MyAnimeListScraper';
import MalNovelCard from './MalNovelCard/MalNovelCard';
import { useTheme } from '@hooks/useTheme';
import MalLoading from '../loadingAnimation/MalLoading';

const BrowseMalScreen = ({ navigation, route }) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [novels, setNovels] = useState([]);
  const [error, setError] = useState();
  const [limit, setLimit] = useState(0);

  const [searchText, setSearchText] = useState('');

  const malUrl = 'https://myanimelist.net/topmanga.php?type=lightnovels';

  const getNovels = async lim => {
    try {
      const data = await scrapeTopNovels(lim ?? limit);

      setNovels(before => before.concat(data));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setNovels([]);
      setLoading(false);
      showToast(err.message);
    }
  };

  const clearSearchbar = () => {
    getNovels();
    setLoading(true);
    setSearchText('');
  };

  const getSearchResults = async () => {
    try {
      setLoading(true);

      const data = await scrapeSearchResults(searchText);

      setNovels(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setNovels([]);
      setLoading(false);
      showToast(err.message);
    }
  };

  useEffect(() => {
    getNovels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }) => (
    <MalNovelCard
      novel={item}
      theme={theme}
      onPress={() =>
        navigation.navigate('GlobalSearchScreen', {
          searchText: item.novelName,
        })
      }
    />
  );

  // const {displayMode, novelsPerRow} = useSettings();

  // const orientation = useDeviceOrientation();

  // const getNovelsPerRow = () => {
  //   if (displayMode === 2) {
  //     return 1;
  //   }

  //   if (orientation === 'landscape') {
  //     return 6;
  //   } else {
  //     return novelsPerRow;
  //   }
  // };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const ListEmptyComponent = () => (
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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colorPrimaryDark }]}
    >
      <SearchbarV2
        theme={theme}
        placeholder="Search MyAnimeList"
        leftIcon="arrow-left"
        handleBackAction={() => navigation.goBack()}
        searchText={searchText}
        onChangeText={text => setSearchText(text)}
        onSubmitEditing={getSearchResults}
        clearSearchbar={clearSearchbar}
        rightIcons={[
          {
            iconName: 'earth',
            onPress: () => WebBrowser.openBrowserAsync(malUrl),
          },
        ]}
      />
      {loading ? (
        <MalLoading theme={theme} />
      ) : (
        <FlatList
          contentContainerStyle={styles.novelsContainer}
          data={novels}
          keyExtractor={item => item.novelName}
          renderItem={renderItem}
          ListEmptyComponent={ListEmptyComponent}
          onScroll={({ nativeEvent }) => {
            if (!searchText && isCloseToBottom(nativeEvent)) {
              getNovels(limit + 50);
              setLimit(before => before + 50);
            }
          }}
          ListFooterComponent={
            !searchText && (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color={theme.primary} />
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default BrowseMalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  novelsContainer: {
    flexGrow: 1,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
});
