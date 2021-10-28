import React, {memo, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import {Row} from '../../../components/Common';

import {parseChapterNumber} from '../../../services/utils/helpers';
import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';

const ChapterItem = ({
  chapter,
  theme,
  index,
  showChapterTitles,
  downloadQueue,
  downloadChapter,
  deleteChapter,
  isSelected,
  onSelectPress,
  onSelectLongPress,
  navigateToChapter,
  showProgressPercentage,
}) => {
  const {chapterId, chapterName, read, releaseDate, bookmark} = chapter;

  const [deleteChapterMenu, setDeleteChapterMenu] = useState(false);
  const showDeleteChapterMenu = () => setDeleteChapterMenu(true);
  const hideDeleteChapterMenu = () => setDeleteChapterMenu(false);

  return (
    <Pressable
      style={[
        styles.chapterCardContainer,
        isSelected(chapterId) && {
          backgroundColor: theme.rippleColor,
        },
      ]}
      onPress={() => onSelectPress(chapter, () => navigateToChapter(chapter))}
      onLongPress={() => onSelectLongPress(chapter)}
      android_ripple={{color: theme.rippleColor}}
    >
      <Row style={{flex: 1, overflow: 'hidden'}}>
        {!!bookmark && <ChapterBookmarkButton theme={theme} />}
        <View>
          <Text
            style={{
              color: read
                ? theme.textColorHint
                : bookmark
                ? theme.colorAccent
                : theme.textColorPrimary,
            }}
            numberOfLines={1}
          >
            {showChapterTitles
              ? parseChapterNumber(chapterName)
                ? 'Chapter ' + parseChapterNumber(chapterName)
                : 'Chapter ' + index
              : chapterName}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 5,
            }}
          >
            {releaseDate ? (
              <Text
                style={{
                  color: read
                    ? theme.textColorHint
                    : bookmark
                    ? theme.colorAccent
                    : theme.textColorSecondary,
                  fontSize: 12,
                }}
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
    paddingHorizontal: 15,
    paddingVertical: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
