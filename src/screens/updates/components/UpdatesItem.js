import React, {memo, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import FastImage from 'react-native-fast-image';
import {DownloadButton} from './DownloadButton';

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
      android_ripple={{color: theme.rippleColor}}
    >
      <>
        <Pressable onPress={onPressCover}>
          <FastImage
            source={{
              uri:
                item.novelCover && !item.novelCover.startsWith('/')
                  ? item.novelCover
                  : 'https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true',
            }}
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
              style={[
                {color: theme.textColorPrimary, fontSize: 14},
                item.read && {
                  color: theme.textColorHint,
                },
              ]}
              numberOfLines={1}
            >
              {item.novelName}
            </Text>
            <Text
              style={[
                {color: theme.textColorPrimary, fontSize: 12},
                item.read && {
                  color: theme.textColorHint,
                },
              ]}
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
  },
  chapterDetails: {
    flex: 1,
    marginLeft: 16,
  },
});
