import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';

import {ChapterItem, Update} from '../../../../database/types';
import {ThemeType} from '../../../../theme/types';
import FastImage from 'react-native-fast-image';
import {IconButton} from '../../../../components';
import {useDownloadQueue} from '../../../../redux/hooks';
import {converUpdateToChapter} from '../../utils/convertUpdateToChapter';

interface UpdateCardProps {
  item: Update;
  navigateToChapter: (
    sourceId: number,
    novelId: number,
    novelName: string,
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) => void;
  navigateToNovel: (sourceId: number, novelUrl: string) => void;
  handleDownloadChapter?: (
    sourceId: number,
    novelUrl: string,
    chapter: ChapterItem,
  ) => void;
  theme: ThemeType;
}

const UpdateCard: React.FC<UpdateCardProps> = ({
  item,
  navigateToChapter,
  navigateToNovel,
  handleDownloadChapter,
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

  return (
    <Pressable
      style={styles.container}
      android_ripple={{color: theme.rippleColor}}
      onPress={() =>
        navigateToChapter(
          item.sourceId,
          item.novelId,
          item.novelName,
          item.chapterId,
          item.chapterUrl,
          item.bookmark,
        )
      }
    >
      <View style={styles.imageContainer}>
        <Pressable
          onPress={() => navigateToNovel(item.sourceId, item.novelUrl)}
        >
          <FastImage source={{uri: item.novelCover}} style={styles.cover} />
        </Pressable>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, {color: titleColor}]} numberOfLines={1}>
            {item.novelName}
          </Text>
          <Text style={[styles.chapterName, {color: chapterNameColor}]}>
            {item.chapterName}
          </Text>
        </View>
      </View>
      {isDownloading ? (
        <ActivityIndicator
          color={theme.textColorHint}
          size={26}
          style={{margin: 8}}
        />
      ) : (
        <IconButton
          name={item.downloaded ? 'check-circle' : 'arrow-down-circle-outline'}
          size={25}
          onPress={() =>
            handleDownloadChapter &&
            handleDownloadChapter(
              item.sourceId,
              item.novelUrl,
              converUpdateToChapter(item),
            )
          }
          theme={theme}
        />
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
});
