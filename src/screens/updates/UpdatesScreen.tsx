import React, { useCallback } from 'react';
import dayjs from 'dayjs';
import { RefreshControl, SectionList, StyleSheet, Text } from 'react-native';

import { EmptyView, ErrorScreenV2, SearchbarV2 } from '@components';

import { convertDateToISOString } from '@database/utils/convertDateToISOString';

import { Update } from '@database/types';

import { useSearch } from '@hooks';
import { useDownload, useUpdates } from '@hooks/persisted';
import { updateLibrary } from '@services/updates';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { useTheme } from '@hooks/persisted';
import UpdatesSkeletonLoading from './components/UpdatesSkeletonLoading';
import UpdateNovelCard from './components/UpdateNovelCard';
import { useFocusEffect } from '@react-navigation/native';
import { deleteChapter } from '@database/queries/ChapterQueries';
import { showToast } from '@utils/showToast';

const UpdatesScreen = () => {
  const theme = useTheme();
  const {
    isLoading,
    updates,
    searchResults,
    clearSearchResults,
    searchUpdates,
    getUpdates,
    lastUpdateTime,
    showLastUpdateTime,
    error,
  } = useUpdates();
  const { queue } = useDownload();
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
    const dateGroups = rawHistory.reduce<
      Record<string, Record<number, Update[]>>
    >((groups, item) => {
      const date = convertDateToISOString(item.updatedTime);
      const novelId = item.novelId;
      if (!groups[date]) {
        groups[date] = {};
      }
      if (!groups[date][novelId]) {
        groups[date][novelId] = [];
      }

      groups[date][novelId] = [...groups[date][novelId], item];
      return groups;
    }, {});

    return Object.keys(dateGroups).map(date => {
      return {
        date,
        data: Object.values(dateGroups[date]), // convert map to 2d array
      };
    });
  };

  useFocusEffect(
    useCallback(() => {
      getUpdates();
    }, [queue]),
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
            onPress: () => updateLibrary(),
          },
        ]}
      />
      {isLoading ? (
        <UpdatesSkeletonLoading theme={theme} />
      ) : error ? (
        <ErrorScreenV2 error={error} />
      ) : (
        <SectionList
          extraData={[updates]}
          ListHeaderComponent={
            showLastUpdateTime && lastUpdateTime ? (
              <LastUpdateTime lastUpdateTime={lastUpdateTime} theme={theme} />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
          sections={groupUpdatesByDate(searchText ? searchResults : updates)}
          renderSectionHeader={({ section: { date } }) => (
            <Text style={[styles.dateHeader, { color: theme.onSurface }]}>
              {dayjs(date).calendar()}
            </Text>
          )}
          keyExtractor={item => 'updatedGroup' + item[0].novelId}
          renderItem={({ item }) => (
            <UpdateNovelCard
              deleteChapter={chapter => {
                deleteChapter(
                  chapter.pluginId,
                  chapter.novelId,
                  chapter.id,
                ).then(() => {
                  showToast(
                    getString('common.deleted', {
                      name: chapter.name,
                    }),
                  );
                  getUpdates();
                });
              }}
              chapterList={item}
              descriptionText={getString('updatesScreen.updatesLower')}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              icon="(˘･_･˘)"
              description={getString('updatesScreen.emptyView')}
              theme={theme}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => updateLibrary()}
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
  lastUpdateTime: Date | number | string;
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
    paddingTop: 8,
    paddingBottom: 2,
  },
  lastUpdateTime: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
