import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { useSelector } from 'react-redux';

import * as WebBrowser from 'expo-web-browser';

import { ErrorView } from '../../../components/ErrorView/ErrorView';
import { SearchbarV2 } from '@components';

import { showToast } from '../../../hooks/showToast';
import TrackerNovelCard from './TrackerNovelCard/TrackerNovelCard';
import { useTheme } from '@hooks/useTheme';
import TrackerLoading from '../loadingAnimation/TrackerLoading';
import { queryAniList } from '../../../services/Trackers/aniList';
import dayjs from 'dayjs';

function formatDate(date) {
  if (date.year && date.month) {
    return `${dayjs.monthsShort()[date.month - 1]} ${date.year}`;
  }

  return '';
}

function datesEqual(date1, date2) {
  return date1.year === date2.year && date1.month === date2.month;
}

const BrowseALScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const tracker = useSelector(state => state.trackerReducer.tracker);

  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [novels, setNovels] = useState([]);
  const [error, setError] = useState();
  const [limit, setLimit] = useState(50);

  const [searchText, setSearchText] = useState('');

  const anilistSearchQuery = `query($search: String, $page: Int) {
    Page(page: $page) {
      pageInfo {
        hasNextPage
      }
      media(search: $search, type: MANGA, format: NOVEL, sort: POPULARITY_DESC) {
        id
        volumes
        title {
          userPreferred
        }
        coverImage {
          extraLarge
        }
        averageScore
        format
        startDate {
          month
          year
        }
        endDate {
          month
          year
        }
      }
    }
  }`;
  const anilistUrl =
    'https://anilist.co/search/manga?format=NOVEL&sort=POPULARITY_DESC';

  const searchAniList = async (onlyTop, page = 1) => {
    try {
      const { data } = await queryAniList(
        anilistSearchQuery,
        {
          search: onlyTop ? undefined : searchText,
          page,
        },
        tracker.auth,
      );

      const results = data.Page.media.map(m => {
        return {
          id: m.id,
          novelName: m.title.userPreferred,
          novelCover: m.coverImage.extraLarge,
          score: `${m.averageScore}%`,
          info: [
            '', // MAL returns an item we don't care about first, so the component ignores the first element
            `Light Novel (${m.volumes || '?'} Vols)`,
            `${formatDate(m.startDate)}${
              datesEqual(m.startDate, m.endDate)
                ? ''
                : `- ${formatDate(m.endDate)}`
            }`,
          ],
        };
      });

      setHasNextPage(data.Page.pageInfo.hasNextPage);
      setNovels(onlyTop ? before => before.concat(results) : results);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setNovels([]);
      setLoading(false);
      showToast(err.message);
    }
  };

  const clearSearchbar = () => {
    setNovels([]);
    setHasNextPage(true);
    searchAniList(true, 1);
    setLoading(true);
    setSearchText('');
  };

  useEffect(() => {
    searchAniList(true);
  }, []);

  const renderItem = ({ item }) => (
    <TrackerNovelCard
      novel={item}
      theme={theme}
      onPress={() =>
        navigation.navigate('GlobalSearchScreen', {
          searchText: item.title,
        })
      }
    />
  );

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
            searchAniList(true);
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
        placeholder="Search AniList"
        leftIcon="arrow-left"
        handleBackAction={() => navigation.goBack()}
        searchText={searchText}
        onChangeText={text => setSearchText(text)}
        onSubmitEditing={() => searchAniList(false, 1)}
        clearSearchbar={clearSearchbar}
        rightIcons={[
          {
            iconName: 'earth',
            onPress: () => WebBrowser.openBrowserAsync(anilistUrl),
          },
        ]}
      />
      {loading ? (
        <TrackerLoading theme={theme} />
      ) : (
        <FlatList
          contentContainerStyle={styles.novelsContainer}
          data={novels}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={ListEmptyComponent}
          onScroll={({ nativeEvent }) => {
            if (hasNextPage && !searchText && isCloseToBottom(nativeEvent)) {
              searchAniList(true, Math.ceil((limit + 50) / 50));
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

export default BrowseALScreen;

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
