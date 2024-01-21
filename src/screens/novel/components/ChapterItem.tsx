import React, { memo, ReactNode, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import color from 'color';

import { Row } from '@components/Common';

import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import { ThemeColors } from '@theme/types';
import { ChapterInfo } from '@database/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';

interface ChapterItemProps {
  isDownloading?: boolean;
  chapter: ChapterInfo;
  theme: ThemeColors;
  showChapterTitles: boolean;
  isSelected?: (id: number) => boolean;
  downloadChapter: () => void;
  deleteChapter: () => void;
  onSelectPress?: (chapter: ChapterInfo) => void;
  onSelectLongPress?: (chapter: ChapterInfo) => void;
  navigateToChapter: (chapter: ChapterInfo) => void;
  showProgressPercentage?: (chapter: ChapterInfo) => any;
  left?: ReactNode;
  isLocal: boolean;
  isUpdateCard?: boolean;
  novelName: string;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  isDownloading,
  chapter,
  theme,
  showChapterTitles,
  downloadChapter,
  deleteChapter,
  isSelected,
  onSelectPress,
  onSelectLongPress,
  navigateToChapter,
  showProgressPercentage,
  isLocal,
  left,
  isUpdateCard,
  novelName,
}) => {
  const { id, name, unread, releaseTime, bookmark, chapterNumber } = chapter;
  const [deleteChapterMenuVisible, setDeleteChapterMenuVisible] =
    useState(false);
  const showDeleteChapterMenu = () => setDeleteChapterMenuVisible(true);
  const hideDeleteChapterMenu = () => setDeleteChapterMenuVisible(false);
  const chapNum = chapterNumber
    ? chapterNumber
    : parseChapterNumber(novelName, name);
  const parsedTime = dayjs(releaseTime);
  return (
    <Pressable
      key={'chapterItem' + id}
      style={[
        styles.chapterCardContainer,
        isSelected?.(id) && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
      onPress={() => {
        onSelectPress ? onSelectPress(chapter) : navigateToChapter(chapter);
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
                  color: unread ? theme.onSurface : theme.outline,
                },
              ]}
              numberOfLines={1}
            >
              {novelName}
            </Text>
          )}
          <Row style={styles.row}>
            {unread ? (
              <MaterialCommunityIcons
                name="circle"
                color={theme.primary}
                size={8}
                style={styles.unreadIcon}
              />
            ) : null}

            <Text
              style={[
                {
                  fontSize: isUpdateCard ? 12 : 14,
                  color: !unread
                    ? theme.outline
                    : bookmark
                    ? theme.primary
                    : theme.onSurfaceVariant,
                },
              ]}
              numberOfLines={1}
            >
              {showChapterTitles ? name : `Chapter ${chapNum} • ID: ${id}`}
            </Text>
          </Row>
          <View style={styles.textRow}>
            {releaseTime && !isUpdateCard ? (
              <Text
                style={[
                  {
                    color: !unread
                      ? theme.outline
                      : bookmark
                      ? theme.primary
                      : theme.onSurfaceVariant,
                  },
                  styles.text,
                ]}
                numberOfLines={1}
              >
                {parsedTime.isValid() ? parsedTime.format('LL') : releaseTime}
              </Text>
            ) : null}
            {showProgressPercentage?.(chapter)}
          </View>
        </View>
      </Row>
      {!isLocal && (
        <DownloadButton
          isDownloading={isDownloading}
          isDownloaded={chapter.isDownloaded}
          theme={theme}
          deleteChapter={deleteChapter}
          downloadChapter={downloadChapter}
          hideDeleteChapterMenu={hideDeleteChapterMenu}
          showDeleteChapterMenu={showDeleteChapterMenu}
          deleteChapterMenuVisible={deleteChapterMenuVisible}
        />
      )}
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
  text: {
    fontSize: 12,
  },
  textRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  row: { flex: 1, overflow: 'hidden' },
  unreadIcon: {
    marginRight: 4,
  },
});
