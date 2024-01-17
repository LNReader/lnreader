import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import dayjs from 'dayjs';
import { Image } from 'react-native';

import { IconButtonV2 } from '@components';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import { History } from '@database/types';
import { ThemeColors } from '@theme/types';
import { coverPlaceholderColor } from '@theme/colors';
import {
  openChapterChapterTypes,
  openChapterNovelTypes,
  openNovelProps,
} from '@utils/handleNavigateParams';

interface HistoryCardProps {
  history: History;
  handleNavigateToChapter: (
    novel: openChapterNovelTypes,
    chapter: openChapterChapterTypes,
  ) => void;
  handleRemoveFromHistory: (chapterId: number) => void;
  handleNavigateToNovel: (novel: openNovelProps) => void;
  theme: ThemeColors;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  history,
  handleNavigateToChapter,
  handleRemoveFromHistory,
  handleNavigateToNovel,
  theme,
}) => {
  const {
    id,
    pluginId,
    novelId,
    novelName,
    novelUrl,
    chapterName,
    novelCover,
    readTime,
    chapterUrl,
    bookmark,
  } = history;
  const chapterNoAndTime = useMemo(
    () =>
      `Chapter ${parseChapterNumber(novelName, chapterName)} • ${dayjs(readTime)
        .format('LT')
        .toUpperCase()}`,
    [chapterName, readTime],
  );

  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={() =>
        handleNavigateToChapter(
          { url: novelUrl, pluginId: pluginId, name: novelName },
          {
            id: id,
            url: chapterUrl,
            novelId: novelId,
            name: chapterName,
            bookmark: bookmark,
          },
        )
      }
    >
      <View style={styles.imageAndNameContainer}>
        <Pressable
          onPress={() =>
            handleNavigateToNovel({
              pluginId,
              id: novelId,
              url: novelUrl,
              name: novelName,
              cover: novelCover,
            })
          }
        >
          <Image source={{ uri: novelCover }} style={styles.cover} />
        </Pressable>
        <View style={styles.detailsContainer}>
          <Text
            numberOfLines={2}
            style={[{ color: theme.onSurface }, styles.novelName]}
          >
            {novelName}
          </Text>
          <Text style={{ color: theme.onSurfaceVariant }}>
            {chapterNoAndTime}
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <IconButtonV2
          name="delete-outline"
          theme={theme}
          onPress={() => handleRemoveFromHistory(id)}
        />
      </View>
    </Pressable>
  );
};

export default HistoryCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cover: {
    height: 80,
    width: 56,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  novelName: {
    marginBottom: 4,
  },
  chapterName: {},
  imageAndNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
