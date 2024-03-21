import React, { useState } from 'react';
import { StyleSheet, SectionList, Text } from 'react-native';
import dayjs from 'dayjs';
import { Portal } from 'react-native-paper';

import { EmptyView, ErrorScreenV2, SearchbarV2 } from '@components';

import { useSearch, useBoolean } from '@hooks';
import { useTheme, useHistory } from '@hooks/persisted';

import { convertDateToISOString } from '@database/utils/convertDateToISOString';

import { History } from '@database/types';
import { getString } from '@strings/translations';
import ClearHistoryDialog from './components/ClearHistoryDialog';
import HistorySkeletonLoading from './components/HistorySkeletonLoading';

import NovelCard from '@components/NovelCard/NovelCard';

const HistoryScreen = () => {
  const theme = useTheme();
  const {
    isLoading,
    history,
    clearAllHistory,
    removeChapterFromHistory,
    getHistory,
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
    const dateGroups = rawHistory.reduce<Record<string, Array<History[]>>>(
      (groups, item) => {
        const date = convertDateToISOString(item.readTime);
        if (!groups[date]) {
          groups[date] = [];
        }
        const lastEntry = groups[date][groups[date].length - 1];
        const ArrayExists = Array.isArray(lastEntry);
        let lastNovel = ArrayExists ? lastEntry[0] : lastEntry;

        if (lastNovel?.novelId === item.novelId) {
          groups[date][groups[date].length - 1].push(item);
        } else {
          groups[date].push([item]);
        }

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

  const {
    value: clearHistoryDialogVisible,
    setTrue: openClearHistoryDialog,
    setFalse: closeClearHistoryDialog,
  } = useBoolean();
  console.log(history.length);

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
            onPress: openClearHistoryDialog,
          },
        ]}
        theme={theme}
      />
      {isLoading ? (
        <HistorySkeletonLoading theme={theme} />
      ) : error ? (
        <ErrorScreenV2 error={error} />
      ) : (
        <>
          <SectionList
            contentContainerStyle={styles.listContainer}
            sections={groupHistoryByDate(searchText ? searchResults : history)}
            keyExtractor={(item, index) => 'history' + index}
            renderSectionHeader={({ section: { date } }) => (
              <Text style={[styles.dateHeader, { color: theme.onSurface }]}>
                {dayjs(date).calendar()}
              </Text>
            )}
            renderItem={({ item }) => (
              <NovelCard
                chapterList={item}
                descriptionText="read"
                updateList={getHistory}
                removeChapterFromHistory={removeChapterFromHistory}
              />
            )}
            ListEmptyComponent={
              <EmptyView
                icon="(˘･_･˘)"
                description={getString('historyScreen.nothingReadRecently')}
                theme={theme}
              />
            }
          />
          <Portal>
            <ClearHistoryDialog
              visible={clearHistoryDialogVisible}
              onSubmit={clearAllHistory}
              onDismiss={closeClearHistoryDialog}
              theme={theme}
            />
          </Portal>
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
