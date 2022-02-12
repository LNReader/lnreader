import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {IconButton} from '../../../../components';

import {ChapterItem} from '../../../../database/types';
import {useDownloadsReducer} from '../../../../redux/hooks';
import {Theme} from '../../../../theme/types';

interface ChapterCardProps {
  chapter: ChapterItem;
  theme: Theme;
  navigateToChapter: (
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) => void;
  handleDownloadChapter: (chapter: ChapterItem) => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  theme,
  navigateToChapter,
  handleDownloadChapter,
}) => {
  const chapterNameColor = chapter.bookmark
    ? theme.primary
    : chapter.read
    ? theme.textColorHint
    : theme.textColorPrimary;
  const dateColor = chapter.bookmark
    ? theme.primary
    : chapter.read
    ? theme.textColorHint
    : theme.textColorSecondary;

  const {downloadQueue} = useDownloadsReducer();

  const handleNavigateToChapter = () =>
    navigateToChapter(chapter.id, chapter.url, chapter.bookmark);

  const isDownloading = downloadQueue.some(item => item.id === chapter.id);

  return (
    <Pressable
      onPress={handleNavigateToChapter}
      android_ripple={{color: theme.rippleColor}}
      style={styles.chapterCardPressable}>
      <View style={styles.flex}>
        <View style={styles.nameContainer}>
          {chapter.bookmark ? (
            <IconButton
              name="bookmark"
              padding={0}
              size={16}
              theme={theme}
              style={styles.bookmarkIcon}
            />
          ) : null}
          <Text
            style={[styles.chapterName, {color: chapterNameColor}]}
            numberOfLines={1}>
            {chapter.name}
          </Text>
        </View>
        {chapter.releaseDate ? (
          <Text style={[styles.date, {color: dateColor}]}>
            {chapter.releaseDate}
          </Text>
        ) : null}
      </View>
      {isDownloading ? (
        <ActivityIndicator
          color={theme.textColorHint}
          size={25}
          style={{margin: 6}}
        />
      ) : (
        <IconButton
          name={
            chapter.downloaded ? 'check-circle' : 'arrow-down-circle-outline'
          }
          size={25}
          padding={6}
          onPress={() => handleDownloadChapter(chapter)}
          theme={theme}
        />
      )}
    </Pressable>
  );
};

export default ChapterCard;

const styles = StyleSheet.create({
  chapterCardPressable: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkIcon: {
    marginRight: 8,
  },
  chapterName: {},
  date: {
    fontSize: 12,
    marginTop: 4,
  },
});
