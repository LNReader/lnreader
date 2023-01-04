import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import color from 'color';

import { ChapterItem, NovelInfo, Update } from '../../../../database/types';
import FastImage from 'react-native-fast-image';
import { IconButtonV2 } from '../../../../components';
import { useDownloadQueue } from '../../../../redux/hooks';
import { Menu } from 'react-native-paper';
import { MD3ThemeType } from '../../../../theme/types';
import {
  coverPlaceholderColor,
  getDialogBackground,
} from '../../../../theme/colors';
import { openNovelProps } from '@utils/handleNavigateParams';
import { useChapterTitle } from '@utils/parseChapterTitle';
import { usePreferences, useSettings } from '@hooks/reduxHooks';

interface UpdateCardProps {
  item: Update;
  navigateToChapter: (novel: NovelInfo, chapter: ChapterItem) => void;
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

  const isDownloading = downloadQueue.some(
    (chapter: ChapterItem) => chapter.chapterId === item.chapterId,
  );

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
  const [menu, setMenu] = useState(false);

  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
      onPress={() => {
        navigateToChapter(item, item);
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
      {isDownloading ? (
        <ActivityIndicator
          color={theme.textColorHint}
          size={26}
          style={styles.downloading}
        />
      ) : !item.downloaded ? (
        <IconButtonV2
          name="arrow-down-circle-outline"
          size={25}
          onPress={() =>
            handleDownloadChapter(item.sourceId, item.novelUrl, item.novelId, {
              ...item,
              chapterTitle: chapterTitle,
            } as ChapterItem)
          }
          color={theme.textColorHint}
          theme={theme}
        />
      ) : (
        <Menu
          visible={menu}
          onDismiss={() => setMenu(false)}
          anchor={
            <IconButtonV2
              name="check-circle"
              size={25}
              onPress={() => setMenu(true)}
              theme={theme}
            />
          }
          contentStyle={{ backgroundColor: getDialogBackground(theme) }}
        >
          <Menu.Item
            onPress={() =>
              handleDeleteChapter(
                item.sourceId,
                item.novelId,
                item.chapterId,
                chapterTitle,
              )
            }
            title="Delete"
            titleStyle={{ color: theme.textColorPrimary }}
          />
        </Menu>
      )}
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
