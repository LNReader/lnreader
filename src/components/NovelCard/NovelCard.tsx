import { StyleSheet, View } from 'react-native';
import React, { useCallback } from 'react';

import {
  ChapterInfo,
  DownloadedChapter,
  NovelInfo,
  Update,
} from '@database/types';
import { List } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ChapterItem from '@screens/novel/components/ChapterItem';
import { useDownload, useTheme } from '@hooks/persisted';
import { noop } from 'lodash-es';
import { RootStackParamList } from '@navigators/types';
import { deleteChapter } from '@database/queries/ChapterQueries';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import { FlatList } from 'react-native-gesture-handler';
import { CardNovelCover } from './CardNovelCover';

interface NovelCardProps {
  chapterList: DownloadedChapter[];
  descriptionText: string;
  chapterDescriptionText?: string | ((chapter: ChapterInfo) => string);
  updateList: () => void;
  removeChapterFromHistory?: (chapterId: number) => void;
}

const NovelCard: React.FC<NovelCardProps> = ({
  chapterList,
  descriptionText,
  chapterDescriptionText,
  updateList,
  removeChapterFromHistory,
}) => {
  const { navigate } = useNavigation<NavigationProp<RootStackParamList>>();
  const { downloadChapter, queue } = useDownload();
  const theme = useTheme();

  const handleDownloadChapter = useCallback(
    (chapter: Update | DownloadedChapter) => {
      if (chapterList.length) {
        downloadChapter(
          {
            id: chapter.novelId,
            pluginId: chapter.pluginId,
            name: chapter.novelName,
          } as NovelInfo,
          chapter,
        );
      }
    },
    [chapterList],
  );
  const removeChapter = (chapter: DownloadedChapter) => {
    deleteChapter(chapter.pluginId, chapter.novelId, chapter.id).then(() => {
      showToast(
        getString('common.deleted', {
          name: chapter.name,
        }),
      );
      updateList();
    });
  };

  const navigateToChapter = useCallback((chapter: ChapterInfo) => {
    const { novelPath, pluginId, novelName } = chapter as
      | Update
      | DownloadedChapter;
    navigate('Chapter', {
      novel: {
        path: novelPath,
        pluginId: pluginId,
        name: novelName,
      } as NovelInfo,
      chapter: chapter,
    });
  }, []);

  const navigateToNovel = () => {
    if (chapterList.length) {
      navigate('Novel', {
        pluginId: chapterList[0].pluginId,
        path: chapterList[0].novelPath,
        name: chapterList[0].novelName,
      });
    }
  };

  if (chapterList.length > 1) {
    return (
      <List.Accordion
        title={chapterList[0].novelName}
        titleStyle={{ fontSize: 14, color: theme.onSurface }}
        left={() => (
          <CardNovelCover
            navigateToNovel={navigateToNovel}
            uri={chapterList[0].novelCover}
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
          keyExtractor={it => 'card' + it.id}
          extraData={[chapterList]}
          scrollEnabled={false}
          renderItem={({ item }) => {
            return (
              <ChapterItem
                isLocal={false}
                isDownloading={queue.some(c => c.chapter.id === item.id)}
                isUpdateCard
                chapter={item}
                theme={theme}
                showChapterTitles={false}
                downloadChapter={() => handleDownloadChapter(item)}
                deleteChapter={() => removeChapter(item)}
                navigateToChapter={navigateToChapter}
                description={
                  typeof chapterDescriptionText === 'string'
                    ? chapterDescriptionText
                    : chapterDescriptionText?.(item)
                }
              />
            );
          }}
        />
      </List.Accordion>
    );
  } else if (chapterList.length > 0) {
    return (
      <ChapterItem
        height="large"
        removeChapterFromHistory={removeChapterFromHistory}
        isLocal={false}
        isDownloading={queue.some(c => c.chapter.id === chapterList[0].id)}
        isUpdateCard
        novelName={chapterList[0].novelName}
        description={
          typeof chapterDescriptionText === 'string'
            ? chapterDescriptionText
            : chapterDescriptionText?.(chapterList[0])
        }
        chapter={chapterList[0]}
        theme={theme}
        showChapterTitles={false}
        downloadChapter={() => handleDownloadChapter(chapterList[0])}
        deleteChapter={() => removeChapter(chapterList[0])}
        navigateToChapter={navigateToChapter}
        left={
          <View style={styles.novelCover}>
            <CardNovelCover
              navigateToNovel={navigateToNovel}
              uri={chapterList[0].novelCover}
            />
          </View>
        }
      />
    );
  }
  return null;
};

export default NovelCard;

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    height: 76,
  },
  container: {
    justifyContent: 'space-between',
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
});
