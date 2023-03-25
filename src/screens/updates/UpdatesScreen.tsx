import React from 'react';
import dayjs from 'dayjs';
import { RefreshControl, SectionList, StyleSheet, Text } from 'react-native';

import { EmptyView, ErrorScreenV2, SearchbarV2 } from '../../components';

import { convertDateToISOString } from '../../database/utils/convertDateToISOString';

import { Update } from '../../database/types';

import { useSearch, useUpdates } from '../../hooks';
import { useAppDispatch } from '../../redux/hooks';
import { updateLibraryAction } from '../../redux/updates/updates.actions';

import { getString } from '../../../strings/translations';
import { ThemeColors } from '../../theme/types';
import { useTheme } from '@hooks/useTheme';
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
          sections={groupUpdatesByDate(searchText ? searchResults : updates)}
          renderSectionHeader={({ section: { date } }) => (
            <Text style={[styles.dateHeader, { color: theme.onSurface }]}>
              {dayjs(date).calendar()}
            </Text>
          )}
          keyExtractor={item => item[0].chapterId.toString()}
          renderItem={({ item }) => (
            <UpdateNovelCard
              item={item}
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
