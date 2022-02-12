import React, {useState} from 'react';
import {StyleSheet, SectionList, Text} from 'react-native';
import {
  EmptyView,
  ErrorScreen,
  LoadingScreen,
  Searchbar,
} from '../../components';

import useHistory from './hooks/useHistory';
import {useSearch} from '../../hooks';
import {useTheme} from '../../redux/hooks';

import {History} from '../../database/types';
import HistoryCard from './components/HistoryCard/HistoryCard';
import {convertDateToISOString} from '../../database/utils/convertDateToISOString';
import moment from 'moment';
import {dateFormats} from '../../utils/constants/dateFormats';
import {useNavigation} from '@react-navigation/native';

const HistoryScreen = () => {
  const theme = useTheme();
  const {navigate} = useNavigation();

  const {isLoading, history, clearAllHistory, removeChapterFromHistory, error} =
    useHistory();

  const {searchText, setSearchText, clearSearchbar} = useSearch();
  const [searchResults, setSearchResults] = useState<History[]>([]);

  const onChangeText = (text: string) => {
    setSearchText(text);
    setSearchResults(
      history.filter(item =>
        item.novelName.toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  const groupHistoryByDate = (rawHistory: History[]) => {
    const dateGroups = rawHistory.reduce<Record<string, History[]>>(
      (groups, item) => {
        const date = convertDateToISOString(item.historyTimeRead);

        if (!groups[date]) {
          groups[date] = [];
        }

        groups[date].push(item);

        return groups;
      },
      {},
    );

    const groupedHistory = Object.keys(dateGroups).map(date => {
      return {
        date,
        data: dateGroups[date],
      };
    });

    return groupedHistory;
  };

  const handleNavigateToChapter = (
    sourceId: number,
    novelId: number,
    novelName: string,
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) =>
    navigate(
      'ReaderScreen' as never,
      {
        sourceId,
        novelId,
        novelName,
        chapterId,
        chapterUrl,
        isBookmarked,
      } as never,
    );

  const handleNavigateToNovel = (
    sourceId: number,
    novelId: number,
    novelUrl: string,
    novelName: string,
    coverUri: string,
  ) =>
    navigate(
      'NovelScreen' as never,
      {
        sourceId,
        novelId,
        novelUrl,
        novelName,
        coverUri,
      } as never,
    );

  return (
    <>
      <Searchbar
        searchText={searchText}
        placeholder="Search history"
        leftIcon="magnify"
        onChangeText={onChangeText}
        clearSearchbar={clearSearchbar}
        rightIcons={[
          {
            iconName: 'delete-sweep-outline',
            onPress: clearAllHistory,
          },
        ]}
        theme={theme}
      />
      {isLoading ? (
        <LoadingScreen theme={theme} />
      ) : error ? (
        <ErrorScreen error={error} theme={theme} />
      ) : (
        <>
          <SectionList
            contentContainerStyle={styles.listContainer}
            sections={groupHistoryByDate(searchText ? searchResults : history)}
            renderSectionHeader={({section: {date}}) => (
              <Text
                style={[styles.dateHeader, {color: theme.textColorSecondary}]}
              >
                {moment(date).calendar(null, dateFormats)}
              </Text>
            )}
            renderItem={({item}) => (
              <HistoryCard
                history={item}
                handleNavigateToChapter={handleNavigateToChapter}
                handleRemoveFromHistory={removeChapterFromHistory}
                handleNavigateToNovel={handleNavigateToNovel}
                theme={theme}
              />
            )}
            ListEmptyComponent={
              <EmptyView
                icon="(˘･_･˘)"
                description="Nothing read recently"
                theme={theme}
              />
            }
          />
        </>
      )}
    </>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
