import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  Text,
  SectionList,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import EmptyView from '../../components/EmptyView';
import {
  getUpdatesAction,
  updateLibraryAction,
} from '../../redux/updates/updates.actions';
import UpdatesItem from './components/UpdatesItem';
import {useTheme} from '../../hooks/reduxHooks';
import {Searchbar} from '../../components/Searchbar/Searchbar';

import moment from 'moment';
import {dateFormat} from '../../services/utils/constants';
import {
  deleteChapterAction,
  downloadChapterAction,
} from '../../redux/novel/novel.actions';

const Updates = ({navigation}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    updates,
    lastUpdateTime = null,
    showLastUpdateTime = true,
    loading,
  } = useSelector(state => state.updatesReducer);
  const {downloadQueue} = useSelector(state => state.downloadsReducer);

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  let sectionedUpdates = [];

  sectionedUpdates = updates.length && updates[0].data !== undefined && updates;

  useFocusEffect(
    useCallback(() => {
      dispatch(getUpdatesAction());
    }, [dispatch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(updateLibraryAction());
    setRefreshing(false);
  };

  const onPress = useCallback(
    item =>
      navigation.navigate('Chapter', {
        chapterId: item.chapterId,
        chapterUrl: item.chapterUrl,
        sourceId: item.sourceId,
        novelUrl: item.novelUrl,
        chapterName: item.chapterName,
        novelId: item.novelId,
        novelName: item.novelName,
        bookmark: item.bookmark,
      }),
    [navigation],
  );

  const onPressCover = useCallback(
    item =>
      navigation.navigate('Novel', {
        sourceId: item.sourceId,
        novelUrl: item.novelUrl,
        novelName: item.novelName,
        novelCover: item.novelCover,
      }),
    [navigation],
  );

  const downloadChapter = useCallback(
    (sourceId, novelUrl, chapterUrl, chapterName, chapterId) => {
      dispatch(
        downloadChapterAction(
          sourceId,
          novelUrl,
          chapterUrl,
          chapterName,
          chapterId,
        ),
      );
    },
    [dispatch],
  );

  const deleteChapter = useCallback(
    (chapterId, chapterName) => {
      dispatch(deleteChapterAction(chapterId, chapterName));
      dispatch(getUpdatesAction());
    },
    [dispatch],
  );

  const renderItem = ({item}) => (
    <UpdatesItem
      item={item}
      theme={theme}
      onPress={() => onPress(item)}
      onPressCover={() => onPressCover(item)}
      downloadQueue={downloadQueue}
      deleteChapter={deleteChapter}
      downloadChapter={downloadChapter}
    />
  );

  const ListFooterComponent = () =>
    loading && <ActivityIndicator size="small" color={theme.colorAccent} />;

  const ListEmptyComponent = () =>
    !loading && <EmptyView icon="(˘･_･˘)" description="No recent updates" />;

  const clearSearchbar = () => setSearchText('');

  const onChangeText = text => {
    setSearchText(text);
    let results = [];

    text !== '' &&
      updates.map(item => {
        const date = item.date;
        const chapters = item.data.filter(chapter =>
          chapter.novelName.toLowerCase().includes(text.toLowerCase()),
        );

        if (chapters.length > 0) {
          results.push({
            date,
            data: chapters,
          });
        }
      });

    setSearchResults(results);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colorPrimaryDark}]}>
      <Searchbar
        placeholder="Search Updates"
        searchText={searchText}
        clearSearchbar={clearSearchbar}
        onChangeText={onChangeText}
        backAction="magnify"
        theme={theme}
        actions={[
          {
            icon: 'reload',
            onPress: () => dispatch(updateLibraryAction()),
          },
        ]}
      />
      {showLastUpdateTime && lastUpdateTime && (
        <Text
          style={[styles.lastUpdateTime, {color: theme.textColorSecondary}]}
        >
          Library last updated: {moment(lastUpdateTime).fromNow()}
        </Text>
      )}
      <SectionList
        contentContainerStyle={styles.flatList}
        sections={searchText ? searchResults : sectionedUpdates}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        renderSectionHeader={({section: {date}}) => (
          <Text style={[styles.header, {color: theme.textColorSecondary}]}>
            {moment(date).calendar(null, dateFormat)}
          </Text>
        )}
        ListFooterComponent={<ListFooterComponent />}
        ListEmptyComponent={<ListEmptyComponent />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['white']}
            progressBackgroundColor={theme.colorAccent}
          />
        }
      />
    </View>
  );
};

export default Updates;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
  },
  lastUpdateTime: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    textAlign: 'center',
  },
});
