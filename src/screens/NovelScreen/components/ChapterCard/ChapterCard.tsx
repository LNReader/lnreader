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
import {useDownloadQueue, useSavedChapterData} from '../../../../redux/hooks';
import {ThemeType} from '../../../../theme/types';

interface ChapterCardProps {
  chapter: ChapterItem;
  theme: ThemeType;
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

  const {progressPercentage = 0} = useSavedChapterData(chapter.chapterId) || {};

  const downloadQueue = useDownloadQueue();

  const handleNavigateToChapter = () =>
    navigateToChapter(chapter.chapterId, chapter.chapterUrl, chapter.bookmark);

  const isDownloading = downloadQueue.some(
    item => item.chapterId === chapter.chapterId,
  );

  return (
    <Pressable
      onPress={handleNavigateToChapter}
      android_ripple={{color: theme.rippleColor}}
      style={styles.chapterCardPressable}
    >
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
            numberOfLines={1}
          >
            {chapter.chapterName}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          {chapter.releaseDate ? (
            <Text style={[styles.date, {color: dateColor}]}>
              {chapter.releaseDate}
            </Text>
          ) : null}
          {progressPercentage > 0 && progressPercentage < 100 ? (
            <Text style={[styles.progress, {color: dateColor}]}>
              {`${chapter.releaseDate ? '  •  ' : ''}${progressPercentage}%`}
            </Text>
          ) : null}
        </View>
      </View>
      {isDownloading ? (
        <ActivityIndicator
          color={theme.textColorHint}
          size={26}
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
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bookmarkIcon: {
    marginRight: 8,
  },
  chapterName: {},
  date: {
    fontSize: 12,
  },
  progress: {
    fontSize: 12,
  },
});
