import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import { RefreshControl, SectionList, StyleSheet, Text } from 'react-native';

import {
  EmptyView,
  ErrorScreenV2,
  LoadingScreenV2,
  SearchbarV2,
} from '../../components';

import { convertDateToISOString } from '../../database/utils/convertDateToISOString';

import { ChapterItem, Update } from '../../database/types';

import { useSearch, useUpdates } from '../../hooks';
import { useAppDispatch, useThemeV1 } from '../../redux/hooks';
import { dateFormats } from '../../utils/constants/dateFormats';
import UpdateCard from './components/UpdateCard/UpdateCard';
import { updateLibraryAction } from '../../redux/updates/updates.actions';
import {
  deleteChapterAction,
  downloadChapterAction,
} from '../../redux/novel/novel.actions';

const UpdatesScreen = () => {
  const theme = useThemeV1();
  const { navigate } = useNavigation();
  const dispatch = useAppDispatch();

  const {
    isLoading,
    updates,
    searchResults,
    clearSearchResults,
    searchUpdates,
    error,
  } = useUpdates();

  const { searchText, setSearchText, clearSearchbar } = useSearch();

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

  const handleDownloadChapter = (
    sourceId: number,
    novelUrl: string,
    chapter: ChapterItem,
  ) =>
    dispatch(
      downloadChapterAction(
        sourceId,
        novelUrl,
        chapter.chapterUrl,
        chapter.chapterName,
        chapter.chapterId,
      ),
    );

  const handleDeleteChapter = (chapterId: number, chapterName: string) =>
    dispatch(deleteChapterAction(chapterId, chapterName));

  const navigateToChapter = (
    sourceId: number,
    novelId: number,
    novelName: string,
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) =>
    navigate(
      'Chapter' as never,
      {
        sourceId,
        novelId,
        novelName,
        chapterId,
        chapterUrl,
        isBookmarked,
      } as never,
    );

  const navigateToNovel = (sourceId: number, novelUrl: string) =>
    navigate(
      'Novel' as never,
      {
        sourceId,
        novelUrl,
      } as never,
    );

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        clearSearchbar={handleClearSearchbar}
        placeholder="Search updates"
        onChangeText={onChangeText}
        leftIcon="magnify"
        theme={theme}
        rightIcons={[
          {
            iconName: 'reload',
            onPress: () => dispatch(updateLibraryAction()),
          },
        ]}
      />
      {isLoading ? (
        <LoadingScreenV2 theme={theme} />
      ) : error ? (
        <ErrorScreenV2 error={error} theme={theme} />
      ) : (
        <SectionList
          contentContainerStyle={styles.listContainer}
          keyExtractor={item => item.chapterId.toString()}
          sections={groupUpdatesByDate(
            searchResults.length > 0 ? searchResults : updates,
          )}
          renderSectionHeader={({ section: { date } }) => (
            <Text
              style={[styles.dateHeader, { color: theme.textColorSecondary }]}
            >
              {moment(date).calendar(null, dateFormats)}
            </Text>
          )}
          renderItem={({ item }) => (
            <UpdateCard
              item={item}
              navigateToChapter={navigateToChapter}
              navigateToNovel={navigateToNovel}
              handleDownloadChapter={handleDownloadChapter}
              handleDeleteChapter={handleDeleteChapter}
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
              refreshing={false}
              onRefresh={() => dispatch(updateLibraryAction())}
              colors={[theme.textColorPrimary]}
              progressBackgroundColor={theme.colorAccent}
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
