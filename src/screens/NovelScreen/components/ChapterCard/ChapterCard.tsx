import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Menu} from 'react-native-paper';
import {IconButton} from '../../../../components';

import {ChapterItem} from '../../../../database/types';
import {
  useDownloadQueue,
  useSavedChapterData,
  useSavedNovelData,
} from '../../../../redux/hooks';
import {ChapterTitleDisplayModes} from '../../../../redux/localStorage/localStorageSlice';
import {ThemeType} from '../../../../theme/types';
import {parseChapterNumber} from '../../../../utils/parseChapterNumber';

interface ChapterCardProps extends PressableProps {
  chapter: ChapterItem;
  theme: ThemeType;
  navigateToChapter: (
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) => void;
  handleDownloadChapter: (chapter: ChapterItem) => void;
  handleDeleteChapter: (chapterId: number) => void;
  isSelected: boolean;
}

const ChapterCard: React.FC<ChapterCardProps> = props => {
  const {
    chapter,
    theme,
    handleDownloadChapter,
    handleDeleteChapter,
    isSelected,
  } = props;

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

  const {progressPercentage = 0} = useSavedChapterData(chapter.chapterId);

  const {chapterTitleDisplayMode = ChapterTitleDisplayModes.SOURCE_TITLE} =
    useSavedNovelData(chapter.novelId);

  const downloadQueue = useDownloadQueue();

  const isDownloading = downloadQueue.some(
    item => item.chapterId === chapter.chapterId,
  );

  const chapterName = useMemo(() => {
    return chapterTitleDisplayMode === ChapterTitleDisplayModes.SOURCE_TITLE
      ? chapter.chapterName
      : `Chapter ${parseChapterNumber(chapter.chapterName)}`;
  }, [chapterTitleDisplayMode, chapter.chapterName]);

  const [menu, setMenu] = useState(false);

  return (
    <Pressable
      android_ripple={{color: theme.rippleColor}}
      style={[
        styles.chapterCardPressable,
        isSelected && {backgroundColor: theme.rippleColor},
      ]}
      {...props}
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
            {chapterName}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          {chapter.releaseDate ? (
            <Text style={[styles.date, {color: dateColor}]}>
              {chapter.releaseDate}
            </Text>
          ) : null}
          {progressPercentage > 0 && progressPercentage < 100 ? (
            <Text style={[styles.progress, {color: theme.textColorHint}]}>
              {`${
                chapter.releaseDate ? '  •  ' : ''
              }Progress ${progressPercentage}%`}
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
      ) : !chapter.downloaded ? (
        <IconButton
          name="arrow-down-circle-outline"
          size={25}
          onPress={() => handleDownloadChapter(chapter)}
          padding={6}
          theme={theme}
        />
      ) : (
        <Menu
          visible={menu}
          onDismiss={() => setMenu(false)}
          anchor={
            <IconButton
              name="check-circle"
              size={25}
              padding={6}
              onPress={() => setMenu(true)}
              theme={theme}
            />
          }
          contentStyle={{backgroundColor: theme.surface}}
        >
          <Menu.Item
            onPress={() => handleDeleteChapter(chapter.chapterId)}
            title="Delete"
            titleStyle={{color: theme.textColorPrimary}}
          />
        </Menu>
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
