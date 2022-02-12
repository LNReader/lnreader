import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {RefreshControl, SectionList, StyleSheet, Text} from 'react-native';

import {
  EmptyView,
  ErrorScreen,
  LoadingScreen,
  Searchbar,
} from '../../components';

import {convertDateToISOString} from '../../database/utils/convertDateToISOString';

import {ChapterItem, Update} from '../../database/types';

import {useSearch} from '../../hooks';
import useDownloader from '../../hooks/useDownloader';
import {useTheme} from '../../redux/hooks';
import {dateFormats} from '../../utils/constants/dateFormats';
import UpdateCard from './components/UpdateCard/UpdateCard';
import useLibraryUpdates from './hooks/useLibraryUpdate';
import useUpdates from './hooks/useUpdates';

const UpdatesScreen = () => {
  const theme = useTheme();
  const {navigate} = useNavigation();

  const {
    isLoading,
    updates,
    searchResults,
    clearSearchResults,
    searchUpdates,
    error,
  } = useUpdates();

  const {isUpdating, updateLibrary} = useLibraryUpdates();

  const {searchText, setSearchText, clearSearchbar} = useSearch();

  const onChangeText = (text: string) => {
    setSearchText(text);
    searchUpdates(text);
  };

  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  const groupUpdatesByDate = (rawHistory: Update[]) => {
    const dateGroups = rawHistory.reduce<Record<string, Update[]>>(
      (groups, item) => {
        const date = convertDateToISOString(item.updateTime);

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

  const {downloadChapters} = useDownloader();

  const handleDownloadChapter = (sourceId: number, chapter: ChapterItem) =>
    downloadChapters(sourceId, [chapter]);

  const navigateToChapter = (
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

  return (
    <>
      <Searchbar
        searchText={searchText}
        clearSearchbar={handleClearSearchbar}
        placeholder="Search updates"
        onChangeText={onChangeText}
        leftIcon="magnify"
        theme={theme}
        rightIcons={[{iconName: 'reload', onPress: updateLibrary}]}
      />
      {isLoading ? (
        <LoadingScreen theme={theme} />
      ) : error ? (
        <ErrorScreen error={error} theme={theme} />
      ) : (
        <SectionList
          contentContainerStyle={styles.listContainer}
          sections={groupUpdatesByDate(
            searchResults.length > 1 ? searchResults : updates,
          )}
          renderSectionHeader={({section: {date}}) => (
            <Text
              style={[styles.dateHeader, {color: theme.textColorSecondary}]}
            >
              {moment(date).calendar(null, dateFormats)}
            </Text>
          )}
          renderItem={({item}) => (
            <UpdateCard
              item={item}
              navigateToChapter={navigateToChapter}
              handleDownloadChapter={handleDownloadChapter}
              theme={theme}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              icon="(˘･_･˘)"
              description="No recent updates"
              theme={theme}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isUpdating}
              onRefresh={updateLibrary}
              colors={[theme.onPrimary]}
              progressBackgroundColor={theme.primary}
            />
          }
        />
      )}
    </>
  );
};

export default UpdatesScreen;

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
