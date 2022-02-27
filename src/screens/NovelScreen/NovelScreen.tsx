import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, FlatList, View, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Actionbar, ErrorScreen, LoadingScreen} from '../../components';
import {ChapterCard, NovelScreenHeader} from './components';

import {
  clearNovelReducer,
  getNovel,
  updateChapterDeleted,
} from '../../redux/novel/novelSlice';
import {
  useAppDispatch,
  useNovelReducer,
  useSavedNovelData,
  useTheme,
} from '../../redux/hooks';
import useDownloader from '../../hooks/useDownloader';
import {ChapterItem} from '../../database/types';
import useLibraryUpdates from '../UpdatesScreen/hooks/useLibraryUpdate';
import NovelBottomSheet from './components/NovelBottomSheet/NovelBottomSheet';
import {chapterSortOrders} from './utils/constants';
import {Portal} from 'react-native-paper';
import {deleteChapterFromDb} from '../../database/queries/DownloadQueries';
import SelectionAppbar from './components/SelectionAppbar/SelectionAppbar';
import useSelectChapters from './hooks/useSelectChapters';

interface NovelScreenProps {
  route: {
    params: {
      sourceId: number;
      novelUrl: string;
      novelName: string;
      novelCover: string;
    };
  };
}

const NovelScreen: React.FC<NovelScreenProps> = ({route}) => {
  const {novelUrl, sourceId} = route.params;

  const theme = useTheme();
  const {navigate} = useNavigation();

  const dispatch = useAppDispatch();

  const {loading, novel, chapters} = useNovelReducer();
  const [error, setError] = useState('');

  const {isUpdating, updateNovel} = useLibraryUpdates();

  const {downloadChapters} = useDownloader();

  const {
    selectedChapters,
    selectChapter,
    isSelected,
    clearSelection,
    setSelectedChapters,
  } = useSelectChapters();

  let bottomSheetRef = useRef<any>(null);
  const expandBottomSheet = () => bottomSheetRef.current.show();

  const {sort = chapterSortOrders[0], filters = []} = useSavedNovelData(
    novel ? novel.novelId : -1,
  );

  const handleDownloadChapter = (chapter: ChapterItem) =>
    downloadChapters(sourceId, novelUrl, [chapter]);

  const handleDeleteChapter = (chapterId: number) => {
    deleteChapterFromDb(chapterId);
    dispatch(updateChapterDeleted(chapterId));
  };

  useEffect(() => {
    try {
      dispatch(getNovel({novelUrl, sourceId}));
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, novelUrl, sourceId, sort, JSON.stringify(filters)]);

  useEffect(() => {
    return () => {
      dispatch(clearNovelReducer());
    };
  }, [dispatch]);

  const navigateToChapter = (
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) =>
    navigate(
      'ReaderScreen' as never,
      {
        sourceId,
        novelId: novel?.novelId,
        novelName: novel?.novelName,
        chapterId,
        chapterUrl,
        isBookmarked,
      } as never,
    );

  return loading ? (
    <LoadingScreen theme={theme} />
  ) : error ? (
    <ErrorScreen theme={theme} />
  ) : novel ? (
    <View>
      {selectedChapters.length > 0 ? (
        <SelectionAppbar
          selectedChapters={selectedChapters.length}
          clearSelection={clearSelection}
          selectAllChapters={() => setSelectedChapters(chapters || [])}
          theme={theme}
        />
      ) : null}
      <FlatList
        contentContainerStyle={styles.container}
        data={chapters}
        keyExtractor={item => item.chapterUrl}
        ListHeaderComponent={
          <NovelScreenHeader
            novel={novel}
            theme={theme}
            chapters={chapters}
            expandBottomSheet={expandBottomSheet}
          />
        }
        renderItem={({item}) => (
          <ChapterCard
            chapter={item}
            navigateToChapter={navigateToChapter}
            handleDownloadChapter={handleDownloadChapter}
            handleDeleteChapter={handleDeleteChapter}
            onPress={() => {
              if (selectedChapters.length) {
                selectChapter(item);
              } else {
                navigateToChapter(
                  item.chapterId,
                  item.chapterUrl,
                  item.bookmark,
                );
              }
            }}
            onLongPress={() => selectChapter(item)}
            isSelected={isSelected(item)}
            theme={theme}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isUpdating}
            onRefresh={() => novel && updateNovel(novel)}
            colors={[theme.onPrimary]}
            progressBackgroundColor={theme.primary}
          />
        }
      />
      <Portal>
        <Actionbar
          visible={selectedChapters.length > 0}
          actions={[
            {
              icon: 'download-outline',
              onPress: () => {
                downloadChapters(sourceId, novelUrl, selectedChapters);
                clearSelection();
              },
            },
            {
              icon: 'trash-can-outline',
              onPress: () => {
                selectedChapters.map(chapter =>
                  handleDeleteChapter(chapter.chapterId),
                );
                clearSelection();
              },
            },
          ]}
          theme={theme}
        />
        {novel ? (
          <NovelBottomSheet bottomSheetRef={bottomSheetRef} theme={theme} />
        ) : null}
      </Portal>
    </View>
  ) : null;
};

export default NovelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
