import React, { useState } from 'react';
import { StyleSheet, SectionList, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

import {
  EmptyView,
  ErrorScreenV2,
  LoadingScreenV2,
  SearchbarV2,
} from '../../components';
import HistoryCard from './components/HistoryCard/HistoryCard';

import { useSearch, useHistory } from '../../hooks';
import { useThemeV1 } from '../../redux/hooks';

import { dateFormats } from '../../utils/constants/dateFormats';
import { convertDateToISOString } from '../../database/utils/convertDateToISOString';

import { History } from '../../database/types';
import { getString } from '../../../strings/translations';

const HistoryScreen = () => {
  const theme = useThemeV1();
  const { navigate } = useNavigation();

  const {
    isLoading,
    history,
    clearAllHistory,
    removeChapterFromHistory,
    error,
  } = useHistory();

  const { searchText, setSearchText, clearSearchbar } = useSearch();
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
    bookmark: number,
  ) =>
    navigate(
      'Chapter' as never,
      {
        sourceId,
        novelId,
        novelName,
        chapterId,
        chapterUrl,
        bookmark,
      } as never,
    );

  const handleNavigateToNovel = (
    sourceId: number,
    novelId: number,
    novelUrl: string,
    novelName: string,
    novelCover: string,
  ) =>
    navigate(
      'Novel' as never,
      {
        sourceId,
        novelId,
        novelUrl,
        novelName,
        novelCover,
      } as never,
    );

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        placeholder={getString('historyScreen.searchbar')}
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
        <LoadingScreenV2 theme={theme} />
      ) : error ? (
        <ErrorScreenV2 error={error} theme={theme} />
      ) : (
        <>
          <SectionList
            contentContainerStyle={styles.listContainer}
            sections={groupHistoryByDate(searchText ? searchResults : history)}
            keyExtractor={item => item.chapterId.toString()}
            renderSectionHeader={({ section: { date } }) => (
              <Text
                style={[styles.dateHeader, { color: theme.textColorSecondary }]}
              >
                {moment(date).calendar(null, dateFormats)}
              </Text>
            )}
            renderItem={({ item }) => (
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
