import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import FastImage from 'react-native-fast-image';
import { coverPlaceholderColor } from '../../../theme/colors';
import { DownloadButton } from './DownloadButton';

const UpdateCard = ({
  item,
  theme,
  onPress,
  onPressCover,
  downloadQueue,
  downloadChapter,
  deleteChapter,
}) => {
  const [deleteChapterMenu, setDeleteChapterMenu] = useState(false);
  const showDeleteChapterMenu = () => setDeleteChapterMenu(true);
  const hideDeleteChapterMenu = () => setDeleteChapterMenu(false);

  return (
    <Pressable
      style={styles.updateCard}
      onPress={onPress}
      android_ripple={{ color: theme.rippleColor }}
    >
      <>
        <Pressable onPress={onPressCover}>
          <FastImage
            source={{ uri: item.novelCover }}
            style={styles.updateIcon}
          />
        </Pressable>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={styles.chapterDetails}>
            <Text
              style={{
                color: item.read ? theme.outline : theme.onSurface,
              }}
              numberOfLines={1}
            >
              {item.novelName}
            </Text>
            <Text
              style={{
                color: item.read ? theme.outline : theme.onSurfaceVariant,
                fontSize: 12,
              }}
              numberOfLines={1}
            >
              {item.chapterName}
            </Text>
          </View>
          <DownloadButton
            chapter={item}
            deleteChapter={deleteChapter}
            downloadChapter={downloadChapter}
            downloadQueue={downloadQueue}
            showDeleteChapterMenu={showDeleteChapterMenu}
            deleteChapterMenu={deleteChapterMenu}
            hideDeleteChapterMenu={hideDeleteChapterMenu}
            theme={theme}
          />
        </View>
      </>
    </Pressable>
  );
};

export default memo(UpdateCard);

const styles = StyleSheet.create({
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  updateIcon: {
    width: 42,
    height: 42,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  chapterDetails: {
    flex: 1,
    marginLeft: 16,
  },
});
