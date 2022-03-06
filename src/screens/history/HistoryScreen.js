import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  SectionList,
} from 'react-native';

import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import EmptyView from '../../components/EmptyView';
import HistoryItem from './components/HistoryItem';
import RemoveHistoryDialog from './components/RemoveHistoryDialog';
import { Searchbar } from '../../components/Searchbar/Searchbar';

import { dateFormat } from '../../services/utils/constants';
import { useTheme } from '../../hooks/reduxHooks';
import {
  deleteAllHistory,
  deleteHistory,
  getHistoryFromDb,
} from '../../database/queries/HistoryQueries';

import { useModal } from '../../hooks/useModal';

const History = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHistory = async () => {
    const rawHistory = await getHistoryFromDb();

    setHistory(rawHistory);
    setLoading(false);
  };

  /**
   * Confirm Clear History Dialog
   */
  const removeHistoryModal = useModal();

  useFocusEffect(
    useCallback(() => {
      getHistory();
    }, []),
  );

  const deleteChapterHistory = historyId => {
    deleteHistory(historyId);
    setHistory(history.filter(item => item.historyId !== historyId));
  };

  const renderHistoryCard = ({ item }) => (
    <HistoryItem
      dispatch={dispatch}
      history={item}
      theme={theme}
      navigation={navigation}
      deleteHistory={deleteChapterHistory}
    />
  );

  const clearSearchbar = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const onChangeText = text => {
    setSearchText(text);
    let results = [];

    if (text !== '') {
      results = history.filter(novel =>
        novel.novelName.toLowerCase().includes(text.toLowerCase()),
      );
    }

    setSearchResults(groupByDate(results));
  };

  const groupByDate = rawHistory => {
    const groups = rawHistory.reduce((grs, update) => {
      var dateParts = update.historyTimeRead.split('-');
      var jsDate = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2].substr(0, 2),
      );
      const date = jsDate.toISOString();
      if (!grs[date]) {
        grs[date] = [];
      }
      grs[date].push(update);
      return grs;
    }, {});

    const groupedHistory = Object.keys(groups).map(date => {
      return {
        date,
        data: groups[date],
      };
    });

    return groupedHistory;
  };

  return (
    <View style={{ flex: 1 }}>
      <Searchbar
        placeholder="Search History"
        searchText={searchText}
        clearSearchbar={clearSearchbar}
        onChangeText={onChangeText}
        backAction="magnify"
        theme={theme}
        actions={[
          {
            icon: 'delete-sweep',
            onPress: removeHistoryModal.showModal,
          },
        ]}
      />
      <SectionList
        contentContainerStyle={styles.container}
        sections={searchText ? searchResults : groupByDate(history)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderHistoryCard}
        renderSectionHeader={({ section: { date } }) => (
          <Text
            style={[styles.dateHeader, { color: theme.textColorSecondary }]}
          >
            {moment(date).calendar(null, dateFormat)}
          </Text>
        )}
        ListFooterComponent={
          loading && (
            <ActivityIndicator
              size="small"
              color={theme.colorAccent}
              style={{ margin: 16 }}
            />
          )
        }
        ListEmptyComponent={
          !loading && (
            <EmptyView icon="(˘･_･˘)" description="Nothing read recently" />
          )
        }
      />
      <RemoveHistoryDialog
        dialogVisible={removeHistoryModal.visible}
        hideDialog={removeHistoryModal.hideModal}
        theme={theme}
        onPress={() => {
          deleteAllHistory();
          setHistory([]);
          removeHistoryModal.hideModal();
        }}
      />
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  dateHeader: {
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
