import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import color from 'color';
import isEqual from 'react-fast-compare';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Row } from '@components/Common';

import { useBoolean, useTheme } from '@hooks';
import { ChapterItemExtended } from '@database/types';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';

interface ChapterItemProps {
  chapter: ChapterItemExtended;
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
  left?: ReactNode;

  isUpdateCard?: boolean;
  novelName?: string;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
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
  left,
  isUpdateCard,
  novelName,
}) => {
  const theme = useTheme();

  const { chapterId, chapterName, read, releaseDate, bookmark } = chapter;

  const {
    value: isMenuVisible,
    setTrue: showMenu,
    setFalse: hideMenu,
  } = useBoolean();

  const chapterNumber = parseChapterNumber(chapterName);

  return (
    <Pressable
      style={[
        styles.chapterCardContainer,
        isSelected?.(chapterId) && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
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
        {left}
        {!!bookmark && <ChapterBookmarkButton theme={theme} />}
        <View style={{ flex: 1 }}>
          {isUpdateCard && (
            <Text
              style={[
                {
                  fontSize: 14,
                  color: read ? theme.outline : theme.onSurface,
                },
              ]}
              numberOfLines={1}
            >
              {novelName}
            </Text>
          )}
          <View style={styles.row}>
            {!chapter.read ? (
              <MaterialCommunityIcons
                name="circle"
                color={theme.primary}
                size={8}
                style={styles.unreadIcon}
              />
            ) : null}
            <Text
              style={{
                fontSize: isUpdateCard ? 12 : 14,
                color: read
                  ? theme.outline
                  : bookmark
                  ? theme.primary
                  : theme.onSurface,
              }}
              numberOfLines={1}
            >
              {showChapterTitles
                ? chapterNumber
                  ? 'Chapter ' + chapterNumber
                  : 'Chapter ' + index
                : chapterName}
            </Text>
          </View>
          <View style={styles.textRow}>
            {releaseDate && !isUpdateCard ? (
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
        hideDeleteChapterMenu={hideMenu}
        showDeleteChapterMenu={showMenu}
        deleteChapterMenuVisible={isMenuVisible}
      />
    </Pressable>
  );
};

export default memo(ChapterItem, isEqual);

const styles = StyleSheet.create({
  chapterCardContainer: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
  },
  textRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadIcon: {
    marginRight: 4,
  },
});
