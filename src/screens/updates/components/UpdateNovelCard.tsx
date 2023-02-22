import { FlatList, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';

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
  descriptionText: string;
  keyProp: number;
  removeItemFromList?: boolean;
}

const UpdateNovelCard: React.FC<UpdateCardProps> = ({
  item,
  dispatch,
  theme,
  descriptionText,
  keyProp,
  removeItemFromList,
}) => {
  const { navigate } = useNavigation();
  const [chapterList, setChapterList] = useState(item);
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

  const handleDeleteChapter = (chapter: ChapterItemExtended) => {
    dispatch(
      deleteChapterAction(
        chapter.sourceId,
        chapter.novelId,
        chapter.chapterId,
        chapter.chapterName,
      ),
    );
    if (removeItemFromList) {
      //@ts-ignore
      let index = item.indexOf(chapter);
      item.splice(index, 1);
      setChapterList(Array.from(item));
    }
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

  const BookCover = () => {
    return (
      <View>
        <FastImage
          source={{ uri: chapterList[0].novelCover }}
          style={styles.cover}
        />
      </View>
    );
  };
  if (chapterList.length > 0) {
    return (
      <View style={styles.relativ} key={keyProp}>
        <List.Accordion
          key={keyProp}
          title={chapterList[0].novelName}
          left={BookCover}
          theme={{ colors: theme }}
          style={[styles.container, styles.padding]}
          description={chapterList.length + ' ' + descriptionText}
          onLongPress={() => navigateToNovel(chapterList[0])}
        >
          <FlatList
            key={'FL' + keyProp}
            data={chapterList}
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
  }
  return null;
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
