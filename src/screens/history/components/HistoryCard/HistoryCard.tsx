import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import dayjs from 'dayjs';
import FastImage from 'react-native-fast-image';

import { IconButtonV2 } from '@components';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import { History } from '@database/types';
import { ThemeColors } from '@theme/types';
import { coverPlaceholderColor } from '@theme/colors';
import {
  ChapterRouteParams,
  NovelRouteParams,
  NovelScreenRouteParams,
} from '@utils/NavigationUtils';

import { defaultUserAgentString } from '@utils/fetch/fetch';

interface HistoryCardProps {
  history: History;
  handleNavigateToChapter: (
    novel: NovelRouteParams,
    chapter: ChapterRouteParams,
  ) => void;
  handleRemoveFromHistory: (historyId: number) => void;
  handleNavigateToNovel: (novel: NovelScreenRouteParams) => void;
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
    historyId,
    sourceId,
    novelId,
    novelName,
    novelUrl,
    chapterId,
    chapterName,
    novelCover,
    historyTimeRead,
    chapterUrl,
    bookmark,
  } = history;

  const chapterNoAndTime = useMemo(
    () =>
      `Chapter ${parseChapterNumber(chapterName)} • ${dayjs(historyTimeRead)
        .format('LT')
        .toUpperCase()}`,
    [chapterName, historyTimeRead],
  );

  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={() =>
        handleNavigateToChapter(
          { sourceId, novelName, novelUrl },
          {
            novelId,
            chapterId,
            chapterUrl,
            chapterName,
            bookmark,
          },
        )
      }
    >
      <View style={styles.imageAndNameContainer}>
        <Pressable
          onPress={() =>
            handleNavigateToNovel({
              sourceId,
              novelId,
              novelUrl,
              novelName,
              novelCover,
            })
          }
        >
          <FastImage
            source={{
              uri: novelCover,
              headers: {
                'User-Agent': defaultUserAgentString,
              },
            }}
            style={styles.cover}
          />
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
          onPress={() => handleRemoveFromHistory(historyId)}
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
