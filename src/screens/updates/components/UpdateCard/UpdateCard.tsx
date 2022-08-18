import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import color from 'color';

import { ChapterItem, Update } from '../../../../database/types';
import FastImage from 'react-native-fast-image';
import { IconButtonV2 } from '../../../../components';
import { useDownloadQueue } from '../../../../redux/hooks';
import { Menu } from 'react-native-paper';
import { MD3ThemeType } from '../../../../theme/types';
import {
  coverPlaceholderColor,
  getDialogBackground,
} from '../../../../theme/colors';

interface UpdateCardProps {
  item: Update;
  navigateToChapter: (
    sourceId: number,
    novelId: number,
    novelName: string,
    novelUrl: string,
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) => void;
  navigateToNovel: (
    sourceId: number,
    novelUrl: string,
    novelName: string,
    novelCover: string,
  ) => void;
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
    chapterName: string,
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

  const [menu, setMenu] = useState(false);

  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
      onPress={() =>
        navigateToChapter(
          item.sourceId,
          item.novelId,
          item.novelName,
          item.novelUrl,
          item.chapterId,
          item.chapterUrl,
          item.bookmark,
        )
      }
    >
      <View style={styles.imageContainer}>
        <Pressable
          onPress={() =>
            navigateToNovel(
              item.sourceId,
              item.novelUrl,
              item.novelName,
              item.novelCover,
            )
          }
        >
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
            {item.chapterName}
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
            handleDownloadChapter(
              item.sourceId,
              item.novelUrl,
              item.novelId,
              item as ChapterItem,
            )
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
                item.chapterName,
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
