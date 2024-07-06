import { Pressable, StyleSheet, View, Image } from 'react-native';
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
import { FlatList } from 'react-native-gesture-handler';
import { defaultCover } from '@plugins/helpers/constants';

const NovelCover = ({
  uri,
  navigateToNovel,
}: {
  uri: string;
  navigateToNovel: () => void;
}) => {
  return (
    <Pressable onPress={navigateToNovel} style={{ alignSelf: 'center' }}>
      <Image source={{ uri }} style={styles.cover} />
    </Pressable>
  );
};

interface UpdateCardProps {
  chapterList: Update[] | DownloadedChapter[];
  descriptionText: string;
  deleteChapter: (chapter: Update | DownloadedChapter) => void;
}

const UpdateNovelCard: React.FC<UpdateCardProps> = ({
  chapterList,
  descriptionText,
  deleteChapter,
}) => {
  const { navigate } = useNavigation<NavigationProp<RootStackParamList>>();
  const { downloadChapter, downloadQueue } = useDownload();
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
          <NovelCover
            navigateToNovel={navigateToNovel}
            uri={chapterList[0].novelCover || defaultCover}
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
          extraData={[chapterList]}
          style={styles.chapterList}
          renderItem={({ item }) => {
            return (
              <ChapterItem
                isLocal={false}
                isDownloading={downloadQueue.some(
                  c => c.data.chapterId === item.id,
                )}
                isUpdateCard
                novelName={chapterList[0].novelName}
                chapter={item}
                theme={theme}
                showChapterTitles={false}
                downloadChapter={() => handleDownloadChapter(item)}
                deleteChapter={() => deleteChapter(item)}
                navigateToChapter={navigateToChapter}
                left={
                  <View style={styles.novelCover}>
                    <NovelCover
                      navigateToNovel={navigateToNovel}
                      uri={chapterList[0].novelCover || defaultCover}
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
        isLocal={false}
        isDownloading={downloadQueue.some(
          c => c.data.chapterId === chapterList[0].id,
        )}
        isUpdateCard
        novelName={chapterList[0].novelName}
        chapter={chapterList[0]}
        theme={theme}
        showChapterTitles={false}
        downloadChapter={() => handleDownloadChapter(chapterList[0])}
        deleteChapter={() => deleteChapter(chapterList[0])}
        navigateToChapter={navigateToChapter}
        left={
          <View style={styles.novelCover}>
            <NovelCover
              navigateToNovel={navigateToNovel}
              uri={chapterList[0].novelCover || defaultCover}
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
    paddingVertical: 2,
  },
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cover: {
    height: 40,
    width: 40,
    borderRadius: 4,
  },
  novelCover: {
    marginRight: 8,
  },
  chapterList: {
    marginLeft: -40,
  },
});
