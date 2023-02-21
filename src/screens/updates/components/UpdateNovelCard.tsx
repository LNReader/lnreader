import { FlatList, Pressable, StyleSheet } from 'react-native';
import React from 'react';

import { ChapterItemExtended, Update } from '../../../database/types';
import FastImage from 'react-native-fast-image';
import { List } from 'react-native-paper';
import { ThemeColors } from '../../../theme/types';
import { coverPlaceholderColor } from '../../../theme/colors';
import {
  openChapter,
  openChapterFunctionTypes,
  openNovel,
  openNovelProps,
} from '@utils/handleNavigateParams';
import { Dispatch } from 'redux';
import {
  deleteChapterAction,
  downloadChapterAction,
} from '@redux/novel/novel.actions';
import { useNavigation } from '@react-navigation/native';
import ChapterItem from '@screens/novel/components/ChapterItem';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

interface UpdateCardProps {
  item: Update[];
  dispatch: Dispatch<any>;
  theme: ThemeColors;
  keyProp: number;
}

const UpdateNovelCard: React.FC<UpdateCardProps> = ({
  item,
  dispatch,
  theme,
  keyProp,
}) => {
  const { navigate } = useNavigation();
  const handleDownloadChapter = (chapter: ChapterItemExtended) =>
    dispatch(
      downloadChapterAction(
        chapter.sourceId,
        chapter.novelUrl,
        chapter.novelId,
        chapter.chapterUrl,
        chapter.chapterName,
        chapter.chapterId,
      ),
    );

  const handleDeleteChapter = (chapterId: number, chapterName: string) =>
    dispatch(
      deleteChapterAction(
        item[0].sourceId,
        item[0].novelId,
        chapterId,
        chapterName,
      ),
    );
  const navigateToChapter = (chapter: ChapterItemExtended) =>
    navigate(
      'Chapter' as never,
      openChapter(chapter, chapter) as openChapterFunctionTypes as never,
    );

  const navigateToNovel = (novel: openNovelProps) =>
    navigate('Novel' as never, openNovel(novel) as openNovelProps as never);

  const { downloadQueue } = useSelector(
    (state: RootState) => state.downloadsReducer,
  );

  const BookCover = () => (
    <Pressable onPress={() => navigateToNovel(item[0])}>
      <FastImage source={{ uri: item[0].novelCover }} style={styles.cover} />
    </Pressable>
  );

  return (
    <List.Accordion
      key={keyProp}
      title={item[0].novelName}
      left={BookCover}
      theme={{ colors: theme }}
      style={styles.container}
      description={item.length + ' new Chapters'}
    >
      <FlatList
        key={'FL' + keyProp}
        data={item}
        keyExtractor={it => it.chapterId.toString()}
        style={styles.flatList}
        renderItem={it => {
          return (
            <ChapterItem
              chapter={it.item}
              theme={theme}
              showChapterTitles={false}
              downloadQueue={downloadQueue}
              downloadChapter={handleDownloadChapter}
              deleteChapter={handleDeleteChapter}
              navigateToChapter={navigateToChapter}
              containerStyle={styles.chapterItem}
            />
          );
        }}
        scrollEnabled={false}
      />
    </List.Accordion>
  );
};

export default UpdateNovelCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  cover: {
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 16,
  },
  chapterName: {
    marginTop: 4,
    fontSize: 12,
  },
  downloading: {
    margin: 8,
  },
  flatList: { marginLeft: -64 },
  chapterItem: { paddingLeft: 48 },
});
