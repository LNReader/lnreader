import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import color from 'color';

import { ChapterItem, NovelInfo, Update } from '../../../../database/types';
import FastImage from 'react-native-fast-image';

import { useDownloadQueue } from '../../../../redux/hooks';
import { MD3ThemeType } from '../../../../theme/types';
import { coverPlaceholderColor } from '../../../../theme/colors';
import { openNovelProps } from '@utils/handleNavigateParams';
import { useChapterTitle } from '@utils/parseChapterTitle';
import { usePreferences, useSettings } from '@hooks/reduxHooks';
import { DownloadButton } from '../DownloadButton';

interface UpdateCardProps {
  item: Update;
  navigateToChapter: (chapter: ChapterItem) => void;
  navigateToNovel: (novel: openNovelProps) => void;
  handleDownloadChapter: (
    sourceId: number,
    novelUrl: string,
    novelId: number,
    chapter: ChapterItem,
  ) => void;
  handleDeleteChapter: (
    sourceId: number,
    novelId: number,
    chapterId: number,
    chapterTitle: string,
  ) => void;
  theme: MD3ThemeType;
}

const UpdateCard: React.FC<UpdateCardProps> = ({
  item,
  navigateToChapter,
  navigateToNovel,
  handleDownloadChapter,
  handleDeleteChapter,
  theme,
}) => {
  const titleColor = item.read ? theme.textColorHint : theme.textColorPrimary;
  const chapterNameColor = item.bookmark
    ? theme.primary
    : item.read
    ? theme.textColorHint
    : theme.textColorSecondary;

  const downloadQueue = useDownloadQueue();

  const {
    defaultShowChapterPrefix = true,
    defaultChapterPrefixStyle = ['Volume ', ' Chapter '],
    defaultChapterTitleSeperator = ' - ',
  } = useSettings();

  const {
    showGeneratedChapterTitle = false,
    showChapterPrefix = defaultShowChapterPrefix,
    chapterPrefixStyle = defaultChapterPrefixStyle,
    chapterTitleSeperator = defaultChapterTitleSeperator,
  } = usePreferences(item.novelId);

  const chapterTitleOptions = {
    showGeneratedChapterTitle: showGeneratedChapterTitle,
    showChapterPrefix: showChapterPrefix,
    chapterPrefixStyle: chapterPrefixStyle,
    chapterTitleSeperator: chapterTitleSeperator,
  };

  const chapterTitle = useChapterTitle(item, chapterTitleOptions);
  const [deleteChapterMenu, setDeleteChapterMenu] = useState(false);
  const showDeleteChapterMenu = () => setDeleteChapterMenu(true);
  const hideDeleteChapterMenu = () => setDeleteChapterMenu(false);

  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
      onPress={() => {
        navigateToChapter(item);
      }}
    >
      <View style={styles.imageContainer}>
        <Pressable onPress={() => navigateToNovel(item)}>
          <FastImage source={{ uri: item.novelCover }} style={styles.cover} />
        </Pressable>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: titleColor }]} numberOfLines={1}>
            {item.novelName}
          </Text>
          <Text
            style={[styles.chapterName, { color: chapterNameColor }]}
            numberOfLines={1}
          >
            {chapterTitle}
          </Text>
        </View>
      </View>
      <DownloadButton
        chapter={{ ...item, chapterTitle: chapterTitle }}
        deleteChapter={handleDeleteChapter}
        downloadChapter={handleDownloadChapter}
        downloadQueue={downloadQueue}
        deleteChapterMenu={deleteChapterMenu}
        showDeleteChapterMenu={showDeleteChapterMenu}
        hideDeleteChapterMenu={hideDeleteChapterMenu}
        theme={theme}
      />
    </Pressable>
  );
};

export default UpdateCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
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
  name: {},
  chapterName: {
    marginTop: 4,
    fontSize: 12,
  },
  downloading: {
    margin: 8,
  },
});
