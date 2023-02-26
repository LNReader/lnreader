import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import color from 'color';

import { Row } from '../../../components/Common';

import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import { ThemeColors } from '@theme/types';
import { ChapterItemExtended } from '@database/types';

interface ChapterItemProps {
  chapter: ChapterItemExtended;
  theme: ThemeColors;
  index?: number;
  downloadQueue: any;
  showChapterTitles: boolean;
  isSelected?: (chapterId: number) => boolean;
  downloadChapter: (chapter: ChapterItemExtended) => (dispatch: any) => void;
  deleteChapter: (chapter: ChapterItemExtended) => void;
  onSelectPress?: (chapter: ChapterItemExtended, arg1: () => void) => void;
  onSelectLongPress?: (chapter: ChapterItemExtended) => void;
  navigateToChapter: (chapter: ChapterItemExtended) => void;
  showProgressPercentage?: (chapter: ChapterItemExtended) => void;
  containerStyle?: ViewStyle;
  showDate?: boolean;
  left?: Function;
  textSize?: number;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
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
  containerStyle,
  showDate,
  left,
  textSize,
}) => {
  const { chapterId, chapterName, read, releaseDate, bookmark } = chapter;
  const [deleteChapterMenuVisible, setDeleteChapterMenuVisible] =
    useState(false);
  const showDeleteChapterMenu = () => setDeleteChapterMenuVisible(true);
  const hideDeleteChapterMenu = () => setDeleteChapterMenuVisible(false);
  const chapterNumber = parseChapterNumber(chapterName);

  return (
    <Pressable
      key={chapterId.toString()}
      style={[
        styles.chapterCardContainer,
        isSelected?.(chapterId) && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
        containerStyle,
      ]}
      onPress={() => {
        onSelectPress
          ? onSelectPress(chapter, () => navigateToChapter(chapter))
          : navigateToChapter(chapter);
      }}
      onLongPress={() => onSelectLongPress?.(chapter)}
      android_ripple={{ color: theme.rippleColor }}
    >
      <Row style={styles.row}>
        {left?.()}
        {!!bookmark && <ChapterBookmarkButton theme={theme} />}
        <View>
          <Text
            style={[
              styles.title,
              {
                fontSize: textSize ?? 14,
                color: read
                  ? theme.outline
                  : bookmark
                  ? theme.primary
                  : theme.onSurface,
              },
            ]}
            numberOfLines={1}
          >
            {showChapterTitles
              ? chapterNumber
                ? 'Chapter ' + chapterNumber
                : 'Chapter ' + index
              : chapterName}
          </Text>
          <View style={styles.textRow}>
            {releaseDate && showDate ? (
              <Text
                style={[
                  {
                    color: read
                      ? theme.outline
                      : bookmark
                      ? theme.primary
                      : theme.onSurfaceVariant,
                  },
                  styles.text,
                ]}
                numberOfLines={1}
              >
                {releaseDate}
              </Text>
            ) : null}
            {showProgressPercentage?.(chapter)}
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
        deleteChapterMenuVisible={deleteChapterMenuVisible}
      />
    </Pressable>
  );
};

export default memo(ChapterItem);

const styles = StyleSheet.create({
  chapterCardContainer: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginTop: 5,
  },
  text: {
    fontSize: 12,
  },
  textRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  row: { flex: 1, overflow: 'hidden' },
});
