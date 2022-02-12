import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, View, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {ErrorScreen, LoadingScreen} from '../../components';
import {ChapterCard, NovelScreenHeader} from './components';

import {getNovel} from '../../redux/novel/novelSlice';
import {useAppDispatch, useNovelReducer, useTheme} from '../../redux/hooks';
import useDownloader from '../../hooks/useDownloader';
import {ChapterItem} from '../../database/types';
import useLibraryUpdates from '../UpdatesScreen/hooks/useLibraryUpdate';

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

  const {downloadChapter} = useDownloader();

  const handleDownloadChapter = (chapter: ChapterItem) =>
    downloadChapter(sourceId, novelUrl, chapter);

  useEffect(() => {
    try {
      dispatch(getNovel({novelUrl, sourceId}));
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, novelUrl, sourceId]);

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
  ) : (
    <View>
      <FlatList
        data={chapters}
        keyExtractor={item => item.chapterUrl}
        ListHeaderComponent={
          <NovelScreenHeader novel={novel} theme={theme} chapters={chapters} />
        }
        renderItem={({item}) => (
          <ChapterCard
            chapter={item}
            navigateToChapter={navigateToChapter}
            handleDownloadChapter={handleDownloadChapter}
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
    </View>
  );
};

export default NovelScreen;

const styles = StyleSheet.create({});
