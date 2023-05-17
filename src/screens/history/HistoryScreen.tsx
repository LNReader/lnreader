import React, { useState } from 'react';
import { StyleSheet, SectionList, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Portal } from 'react-native-paper';

import { EmptyView, ErrorScreenV2, SearchbarV2 } from '../../components/index';
import HistoryCard from './components/HistoryCard/HistoryCard';

import { useSearch, useHistory, useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/useTheme';

import { convertDateToISOString } from '../../database/utils/convertDateToISOString';

import { ExtendedChapter } from '../../database/types';
import { getString } from '@strings/translations';
import ClearHistoryDialog from './components/ClearHistoryDialog';
import {
  openChapterChapterTypes,
  openNovel,
  openNovelProps,
} from '@utils/handleNavigateParams';
import HistorySkeletonLoading from './components/HistorySkeletonLoading';

const HistoryScreen = () => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const {
    isLoading,
    history,
    clearAllHistory,
    removeChapterFromHistory,
    error,
  } = useHistory();

  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const [searchResults, setSearchResults] = useState<ExtendedChapter[]>([]);
  console.log(history[0]);
  const onChangeText = (text: string) => {
    setSearchText(text);
    setSearchResults(
      history.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  const groupHistoryByDate = (rawHistory: ExtendedChapter[]) => {
    const dateGroups = rawHistory.reduce<Record<string, ExtendedChapter[]>>(
      (groups, item) => {
        const date = convertDateToISOString(item.readTime);

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

  const handleNavigateToChapter = (chapter: openChapterChapterTypes) =>
    navigate('Chapter' as never, chapter as never);

  const handleNavigateToNovel = (novel: openNovelProps) =>
    navigate('Novel' as never, openNovel(novel) as openNovelProps as never);

  const {
    value: clearHistoryDialogVisible,
    setTrue: openClearHistoryDialog,
    setFalse: closeClearHistoryDialog,
  } = useBoolean();

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
