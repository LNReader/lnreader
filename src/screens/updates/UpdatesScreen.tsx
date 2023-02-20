import React from 'react';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { RefreshControl, SectionList, StyleSheet, Text } from 'react-native';

import { EmptyView, ErrorScreenV2, SearchbarV2 } from '../../components';

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
import { ThemeColors } from '../../theme/types';
import { useTheme } from '@hooks/useTheme';
import {
  openChapter,
  openChapterChapterTypes,
  openChapterNovelTypes,
  openChapterFunctionTypes,
  openNovel,
  openNovelProps,
} from '@utils/handleNavigateParams';
import UpdatesSkeletonLoading from './components/UpdatesSkeletonLoading';
import UpdateNovelCard from './components/UpdateNovelCard';

const UpdatesScreen = () => {
  const theme = useTheme();
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
    rawHistory2 = [
    
        {
          "bookmark": 0,
          "chapterId": 19891,
          "chapterName": "Chapter 989 - What Is the Flaw?",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_989",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 3,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-19-20",
          "sourceId": 95,
          "updateId": 989,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19890,
          "chapterName": "Chapter 988 - A Present from the Almighty to Jiu",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_988",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 3,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 988,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19889,
          "chapterName": "Chapter 987",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_987",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 3,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 987,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19888,
          "chapterName": "Chapter 986 - Peace",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_986",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 3,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 986,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19887,
          "chapterName": "Chapter 985 - Peace",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_985",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 3,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 985,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19886,
          "chapterName": "Chapter 984 - Peace",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_984",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 3,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 984,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19885,
          "chapterName": "Chapter 983 - : Sweet Intimateness",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_983",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 3,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 983,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19884,
          "chapterName": "Chapter 982 - Qin Mo Came to the Dormitory",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_982",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 5,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 982,
          "updateTime": "2023-02-18 19:51:38"
        },
        {
          "bookmark": 0,
          "chapterId": 19883,
          "chapterName": "Chapter 981 - Qin Mo’s Suspicions",
          "chapterUrl": "https://bestlightnovel.com/novel_888141006/chapter_981",
          "downloaded": 0,
          "novelCover": "https://avatar.novelonlinefree.com/avatar_novels/26549-1580330253.jpg",
          "novelId": 5,
          "novelName": "National School Prince Is A Girl",
          "novelUrl": "https://bestlightnovel.com/novel_888141006",
          "read": 0,
          "releaseDate": "Feb-18-20",
          "sourceId": 95,
          "updateId": 981,
          "updateTime": "2023-02-18 19:51:38"
        }
      ]
    
    ;
    const dateGroups = rawHistory.reduce<Record<string, Update[][]>>(
      (groups, item) => {
        const date = convertDateToISOString(item.updateTime);
        const novelId = item.novelId;

        if (!groups[date]) {
          groups[date] = [];
        }
        if (!groups[date][novelId]) {
          groups[date][novelId] = [];
        }

        groups[date][novelId].push(item);

        return groups;
      },
      {},
    );

    const groupedHistory = Object.keys(dateGroups).map(date => {
      return {
        date,
        data: dateGroups[date].filter(val => val !== null),
      };
    });

    return groupedHistory;
  };

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
        <UpdatesSkeletonLoading theme={theme} />
      ) : error ? (
        <ErrorScreenV2 error={error} />
      ) : (
        <SectionList
          ListHeaderComponent={
            showLastUpdateTime && lastUpdateTime ? (
              <LastUpdateTime lastUpdateTime={lastUpdateTime} theme={theme} />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
          //keyExtractor={item => item.chapterId.toString()}
          sections={groupUpdatesByDate(searchText ? searchResults : updates)}
          renderSectionHeader={({ section: { date } }) => (
            <Text style={[styles.dateHeader, { color: theme.onSurface }]}>
              {dayjs(date).calendar()}
            </Text>
          )}
          /*
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
          */
          renderItem={({ item, index }) => (
            <UpdateNovelCard
              key={index}
              item={item}
              dispatch={dispatch}
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

const LastUpdateTime: React.FC<{
  lastUpdateTime: Date;
  theme: ThemeColors;
}> = ({ lastUpdateTime, theme }) => (
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
    fontSize: 12,
    fontStyle: 'italic',
  },
});
