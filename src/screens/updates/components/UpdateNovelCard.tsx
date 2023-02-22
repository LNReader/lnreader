import { FlatList, Pressable, StyleSheet, View } from 'react-native';
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
  d,
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

  const handleDeleteChapter = (chapterId: number, chapterName: string) => {
    dispatch(
      deleteChapterAction(
        item[0].sourceId,
        item[0].novelId,
        chapterId,
        chapterName,
      ),
    );
    d();
  };

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
    <Pressable
      style={[styles.coverContainer, styles.padding]}
      onPress={() => navigateToNovel(item[0])}
    >
      <FastImage source={{ uri: item[0].novelCover }} style={styles.cover} />
    </Pressable>
  );
  //console.log('Render');
  return (
    <View style={styles.relativ}>
      <BookCover />
      <List.Accordion
        key={keyProp}
        title={item[0].novelName}
        left={() => <View style={styles.cover} />}
        theme={{ colors: theme }}
        style={[styles.container, styles.padding]}
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
    </View>
  );
};

export default UpdateNovelCard;

const styles = StyleSheet.create({
  relativ: {
    position: 'relative',
  },
  padding: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    height: 70,
  },
  container: {
    justifyContent: 'space-between',
  },
  coverContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    justifyContent: 'center',
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
