import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import color from 'color';

import { Row } from '../../../components/Common';

import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';

const ChapterItem = ({
  chapter,
  theme,
  index,
  chapterTitle,
  showGeneratedChapterTitle,
  downloadQueue,
  downloadChapter,
  deleteChapter,
  isSelected,
  onSelectPress,
  onSelectLongPress,
  navigateToChapter,
  showProgressPercentage,
  novelId,
}) => {
  const { chapterId, read, releaseDate, bookmark } = chapter;

  const [deleteChapterMenu, setDeleteChapterMenu] = useState(false);
  const showDeleteChapterMenu = () => setDeleteChapterMenu(true);
  const hideDeleteChapterMenu = () => setDeleteChapterMenu(false);

  return (
    <Pressable
      style={[
        styles.chapterCardContainer,
        isSelected(chapterId) && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
      onPress={() => onSelectPress(chapter, () => navigateToChapter(chapter))}
      onLongPress={() => onSelectLongPress(chapter)}
      android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
    >
      <Row style={styles.row}>
        {!!bookmark && <ChapterBookmarkButton theme={theme} />}
        <View>
          <Text
            style={{
              color: read
                ? theme.textColorHint
                : bookmark
                ? theme.primary
                : theme.textColorPrimary,
            }}
            numberOfLines={1}
          >
            {showGeneratedChapterTitle
              ? 'Chapter ' + (index + 1)
              : chapterTitle}
          </Text>
          <View style={styles.chapter}>
            {releaseDate ? (
              <Text
                style={[
                  {
                    color: read
                      ? theme.textColorHint
                      : bookmark
                      ? theme.primary
                      : theme.textColorSecondary,
                  },
                  styles.text,
                ]}
                numberOfLines={1}
              >
                {releaseDate}
              </Text>
            ) : null}
            {showProgressPercentage(chapter)}
          </View>
        </View>
      </Row>
      <DownloadButton
        downloadQueue={downloadQueue}
        chapter={chapter}
        theme={theme}
        deleteChapter={deleteChapter}
        downloadChapter={downloadChapter}
        hideDeleteChapterMenu={hideDeleteChapterMenu}
        showDeleteChapterMenu={showDeleteChapterMenu}
        deleteChapterMenu={deleteChapterMenu}
      />
    </Pressable>
  );
};

export default memo(ChapterItem);

const styles = StyleSheet.create({
  chapterCardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flex: 1,
    overflow: 'hidden',
  },
  chapter: {
    flexDirection: 'row',
    marginTop: 5,
  },
  text: {
    fontSize: 12,
  },
});
