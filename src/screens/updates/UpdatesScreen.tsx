import React from 'react';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
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
import { useAppDispatch } from '../../redux/hooks';
import UpdateCard from './components/UpdateCard/UpdateCard';
import { updateLibraryAction } from '../../redux/updates/updates.actions';
import {
  deleteChapterAction,
  downloadChapterAction,
} from '../../redux/novel/novel.actions';
import { getString } from '../../../strings/translations';
import { MD3ThemeType } from '../../theme/types';
import { useTheme } from '@hooks/useTheme';

const UpdatesScreen = () => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const dispatch = useAppDispatch();

  const {
    isLoading,
    updates,
    searchResults,
    clearSearchResults,
    searchUpdates,
    lastUpdateTime,
    showLastUpdateTime,
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
    novelId: number,
    chapter: ChapterItem,
  ) =>
    dispatch(
      downloadChapterAction(
        sourceId,
        novelUrl,
        novelId,
        chapter.chapterUrl,
        chapter.chapterName,
        chapter.chapterId,
      ),
    );

  const handleDeleteChapter = (
    sourceId: number,
    novelId: number,
    chapterId: number,
    chapterName: string,
  ) => dispatch(deleteChapterAction(sourceId, novelId, chapterId, chapterName));

  const navigateToChapter = (
    sourceId: number,
    novelId: number,
    novelName: string,
    novelUrl: string,
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
        novelUrl,
        chapterId,
        chapterUrl,
        isBookmarked,
      } as never,
    );

  const navigateToNovel = (
    sourceId: number,
    novelUrl: string,
    novelName: string,
    novelCover: string,
  ) =>
    navigate(
      'Novel' as never,
      {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      } as never,
    );

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        clearSearchbar={handleClearSearchbar}
        placeholder={getString('updatesScreen.searchbar')}
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
          ListHeaderComponent={
            showLastUpdateTime && lastUpdateTime ? (
              <LastUpdateTime lastUpdateTime={lastUpdateTime} theme={theme} />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
          keyExtractor={item => item.chapterId.toString()}
          sections={groupUpdatesByDate(searchText ? searchResults : updates)}
          renderSectionHeader={({ section: { date } }) => (
            <Text style={[styles.dateHeader, { color: theme.onSurface }]}>
              {dayjs(date).calendar()}
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

const LastUpdateTime: React.FC<{ lastUpdateTime: Date; theme: MD3ThemeType }> =
  ({ lastUpdateTime, theme }) => (
    <Text style={[styles.lastUpdateTime, { color: theme.onSurface }]}>
      {`${getString('updatesScreen.lastUpdatedAt')} ${dayjs(
        lastUpdateTime,
      ).fromNow()}`}
    </Text>
  );

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  lastUpdateTime: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: 'center',
  },
});
