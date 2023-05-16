import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';

import { ExtendedChapter } from '@database/types';
import FastImage from 'react-native-fast-image';
import { List } from 'react-native-paper';
import { coverPlaceholderColor } from '@theme/colors';
import { openNovel } from '@utils/handleNavigateParams';
import {
  deleteChapterAction,
  downloadChapterAction,
} from '@redux/novel/novel.actions';
import { useNavigation } from '@react-navigation/native';
import ChapterItem from '@screens/novel/components/ChapterItem';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { useAppDispatch } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { noop } from 'lodash-es';

const NovelCover = ({
  uri,
  navigateToNovel,
}: {
  uri: string;
  navigateToNovel: () => void;
}) => {
  return (
    <Pressable onPress={navigateToNovel}>
      <FastImage source={{ uri }} style={styles.cover} />
    </Pressable>
  );
};

interface UpdateCardProps {
  item: ExtendedChapter[];
  descriptionText: string;
  removeItemFromList?: boolean;
}

const UpdateNovelCard: React.FC<UpdateCardProps> = ({
  item,
  descriptionText,
  removeItemFromList,
}) => {
  const { navigate } = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [chapterList, setChapterList] = useState(item);

  const handleDownloadChapter = useCallback((chapter: ExtendedChapter) => {
    dispatch(downloadChapterAction(chapter));
  }, []);

  const handleDeleteChapter = useCallback((chapter: ExtendedChapter) => {
    dispatch(deleteChapterAction(chapter));
    if (removeItemFromList) {
      //@ts-ignore
      let index = item.indexOf(chapter);
      item.splice(index, 1);
      setChapterList(Array.from(item));
    }
  }, []);

  const navigateToChapter = useCallback(
    (chapter: ExtendedChapter) =>
      navigate(
        'Chapter' as never,
        {
          novel: chapter.novel,
          chapter: chapter,
        } as never,
      ),
    [],
  );

  const navigateToNovel = () =>
    navigate('Novel' as never, openNovel(chapterList[0].novel) as never);

  const { downloadQueue } = useSelector(
    (state: RootState) => state.downloadsReducer,
  );
  if (chapterList.length > 1) {
    return (
      <List.Accordion
        title={chapterList[0].novel.name}
        titleStyle={{ fontSize: 14, color: theme.onSurface }}
        left={() => (
          <NovelCover
            navigateToNovel={navigateToNovel}
            uri={chapterList[0].novel.cover || ''}
          />
        )}
        descriptionStyle={{ fontSize: 12 }}
        theme={{ colors: theme }}
        style={[styles.container, styles.padding]}
        description={`${chapterList.length} ${descriptionText}`}
        onPress={noop}
      >
        <FlatList
          data={chapterList}
          keyExtractor={it => 'update' + it.id}
          style={styles.chapterList}
          renderItem={it => {
            return (
              <ChapterItem
                isUpdateCard
                novelName={chapterList[0].novel.name}
                chapter={it.item}
                theme={theme}
                showChapterTitles={false}
                downloadQueue={downloadQueue}
                downloadChapter={handleDownloadChapter}
                deleteChapter={handleDeleteChapter}
                navigateToChapter={navigateToChapter}
                left={
                  <View style={styles.novelCover}>
                    <NovelCover
                      navigateToNovel={navigateToNovel}
                      uri={chapterList[0].novel.cover || ''}
                    />
                  </View>
                }
              />
            );
          }}
          scrollEnabled={false}
        />
      </List.Accordion>
    );
  } else if (chapterList.length > 0) {
    return (
      <ChapterItem
        isUpdateCard
        novelName={chapterList[0].novel.name}
        chapter={chapterList[0]}
        theme={theme}
        showChapterTitles={false}
        downloadQueue={downloadQueue}
        downloadChapter={handleDownloadChapter}
        deleteChapter={handleDeleteChapter}
        navigateToChapter={navigateToChapter}
        left={
          <View style={styles.novelCover}>
            <NovelCover
              navigateToNovel={navigateToNovel}
              uri={chapterList[0].novel.cover || ''}
            />
          </View>
        }
      />
    );
  }
  return null;
};

export default UpdateNovelCard;

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    height: 64,
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
  novelCover: {
    marginRight: 8,
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
  chapterList: {
    marginLeft: -64,
  },
});
