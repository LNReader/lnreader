import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Appbar as MaterialAppbar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';

import { ScreenContainer } from '../../components/Common';
import EmptyView from '../../components/EmptyView';
import { Appbar, List } from '@components';
import {
  deleteDownloads,
  getDownloadedChapters,
} from '../../database/queries/ChapterQueries';

import { useTheme } from '@hooks/useTheme';

import {
  deleteChapterAction,
  downloadChapterAction,
} from '../../redux/novel/novel.actions';

import UpdatesItem from '../updates/components/UpdatesItem';
import RemoveDownloadsDialog from './components/RemoveDownloadsDialog';
import { openChapter, openNovel } from '@utils/handleNavigateParams';
import UpdatesSkeletonLoading from '@screens/updates/components/UpdatesSkeletonLoading';

const Downloads = ({ navigation }) => {
  const theme = useTheme();

  const dispatch = useDispatch();

  const { downloadQueue } = useSelector(state => state.downloadsReducer);

  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);

  /**
   * Confirm Clear downloads Dialog
   */
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getChapters = async () => {
    const res = await getDownloadedChapters();
    setChapters(res);
    setLoading(false);
  };

  const ListEmptyComponent = () =>
    !loading && <EmptyView icon="(˘･_･˘)" description="No downloads" />;

  useEffect(() => {
    getChapters();
  }, []);

  const onPress = useCallback(
    item => navigation.navigate('Chapter', openChapter(item, item)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onPressCover = useCallback(
    item => navigation.navigate('Novel', openNovel(item)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const downloadChapter = (
    sourceId,
    novelUrl,
    novelId,
    chapterUrl,
    chapterName,
    chapterId,
  ) =>
    dispatch(
      downloadChapterAction(
        sourceId,
        novelUrl,
        novelId,
        chapterUrl,
        chapterName,
        chapterId,
      ),
    );

  const deleteChapter = (chapterId, chapterName) => {
    dispatch(deleteChapterAction(sourceId, novelId, chapterId, chapterName));
    setChapters(chaps => chaps.filter(item => item.chapterId !== chapterId));
  };

  const renderItem = ({ item }) => (
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

  return (
    <ScreenContainer theme={theme}>
      <Appbar title="Downloads" handleGoBack={navigation.goBack} theme={theme}>
        {chapters.length > 0 && (
          <MaterialAppbar.Action
            icon="delete-sweep"
            iconColor={theme.textColorPrimary}
            onPress={showDialog}
          />
        )}
      </Appbar>
      <List.InfoItem
        title="Downloads are saved in a SQLite Database."
        theme={theme}
      />
      {loading ? (
        <UpdatesSkeletonLoading theme={theme} />
      ) : (
        <FlatList
          contentContainerStyle={styles.flatList}
          data={chapters}
          keyExtractor={item => item.chapterId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<ListEmptyComponent />}
        />
      )}
      <RemoveDownloadsDialog
        dialogVisible={visible}
        hideDialog={hideDialog}
        onSubmit={() => {
          deleteDownloads();
          setChapters([]);
          hideDialog();
        }}
        theme={theme}
      />
    </ScreenContainer>
  );
};

export default Downloads;

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatList: { flexGrow: 1, paddingVertical: 8 },
});
