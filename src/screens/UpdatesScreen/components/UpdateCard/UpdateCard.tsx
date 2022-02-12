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
import {useAppSelector} from '../../../../redux/hooks';

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
  handleDownloadChapter?: (sourceId: number, chapter: ChapterItem) => void;
  theme: ThemeType;
}

const UpdateCard: React.FC<UpdateCardProps> = ({
  item,
  navigateToChapter,
  handleDownloadChapter,
  theme,
}) => {
  const titleColor = item.read ? theme.textColorHint : theme.textColorPrimary;
  const chapterNameColor = item.bookmark
    ? theme.primary
    : item.read
    ? theme.textColorHint
    : theme.textColorSecondary;

  const {downloadQueue} = useAppSelector(state => state.downloadsReducer);

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
        <FastImage source={{uri: item.coverUri}} style={styles.cover} />
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
          size={25}
          style={{margin: 6}}
        />
      ) : (
        <IconButton
          name={item.downloaded ? 'check-circle' : 'arrow-down-circle-outline'}
          size={25}
          padding={6}
          onPress={() =>
            handleDownloadChapter(item.sourceId, {
              id: item.chapterId,
              name: item.chapterName,
              url: item.chapterUrl,
              downloaded: item.downloaded,
              novelId: item.novelId,
              bookmark: item.bookmark,
              read: item.read,
            })
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
