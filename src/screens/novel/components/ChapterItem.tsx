import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';
import { ThemeColors } from '@theme/types';
import { ChapterInfo } from '@database/types';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { getString } from '@strings/translations';

interface ChapterItemProps {
  isDownloading?: boolean;
  isBookmarked?: boolean;
  chapter: ChapterInfo;
  theme: ThemeColors;
  showChapterTitles: boolean;
  isSelected?: boolean;
  downloadChapter: () => void;
  deleteChapter: () => void;
  onSelectPress?: (chapter: ChapterInfo) => void;
  onSelectLongPress?: (chapter: ChapterInfo) => void;
  navigateToChapter: (chapter: ChapterInfo) => void;
  setChapterDownloaded?: (value: boolean) => void;
  left?: ReactNode;
  isLocal: boolean;
  isUpdateCard?: boolean;
  novelName: string;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  isDownloading,
  isBookmarked,
  chapter,
  theme,
  showChapterTitles,
  downloadChapter,
  deleteChapter,
  isSelected,
  onSelectPress,
  onSelectLongPress,
  navigateToChapter,
  setChapterDownloaded,
  isLocal,
  left,
  isUpdateCard,
  novelName,
}) => {
  const { id, name, unread, releaseTime, bookmark, chapterNumber, progress } =
    chapter;

  isBookmarked ??= bookmark;

  const highlight = useMemo(
    () => [{ backgroundColor: theme.rippleColor }],
    [theme.rippleColor],
  );

  const pressableStyle = isSelected
    ? [styles.container, highlight]
    : styles.container;

  const titleColour = useMemo(() => {
    if (!unread) return theme.outline;
    return bookmark ? theme.primary : theme.onSurface;
  }, [unread, bookmark, theme]);

  const updateTitle = useMemo(
    () => ({
      fontSize: 14,
      color: unread ? theme.onSurface : theme.outline,
    }),
    [theme.onSurface, theme.outline, unread],
  );
  const title = useMemo(
    () => ({
      fontSize: isUpdateCard ? 12 : 14,
      color: titleColour,
      flex: 1,
    }),
    [isUpdateCard, titleColour],
  );
  const meta = useMemo(
    () => [
      styles.text,
      {
        marginTop: 4,
        color: !unread
          ? theme.outline
          : isBookmarked
          ? theme.primary
          : theme.onSurfaceVariant,
      },
    ],
    [
      isBookmarked,
      theme.onSurfaceVariant,
      theme.outline,
      theme.primary,
      unread,
    ],
  );
  const progressStyle = useMemo(
    () => ({
      fontSize: 12,
      color: theme.outline,
      marginLeft: releaseTime ? 5 : 0,
      marginTop: 4,
    }),
    [releaseTime, theme.outline],
  );

  const handlePress = useCallback(() => {
    onSelectPress ? onSelectPress(chapter) : navigateToChapter(chapter);
  }, [onSelectPress, navigateToChapter, chapter]);

  const handleLong = useCallback(() => {
    onSelectLongPress?.(chapter);
  }, [onSelectLongPress, chapter]);

  return (
    <Pressable
      style={[pressableStyle, styles.row]}
      onPress={handlePress}
      onLongPress={handleLong}
      android_ripple={{ color: theme.rippleColor }}
    >
      {left}
      {isBookmarked ? <ChapterBookmarkButton theme={theme} /> : null}

      <View style={styles.flex1}>
        {isUpdateCard && (
          <Text style={updateTitle} numberOfLines={1}>
            {novelName}
          </Text>
        )}

        <View style={styles.rowCenter}>
          {unread && (
            <MaterialCommunityIcons
              name="circle"
              color={theme.primary}
              size={8}
              style={styles.unreadIcon}
            />
          )}

          <Text style={title} numberOfLines={1} ellipsizeMode="tail">
            {showChapterTitles
              ? name
              : getString('novelScreen.chapterChapnum', {
                  num: chapterNumber,
                })}
          </Text>
        </View>

        <View style={styles.rowCenter}>
          {releaseTime && !isUpdateCard && (
            <Text style={meta} numberOfLines={1}>
              {releaseTime}
            </Text>
          )}

          {!isUpdateCard && (progress ?? 0) > 0 && unread && (
            <Text style={progressStyle} numberOfLines={1}>
              {releaseTime ? '•  ' : ''}
              {getString('novelScreen.progress', { progress })}
            </Text>
          )}
        </View>
      </View>

      {!isLocal && (
        <DownloadButton
          isDownloading={isDownloading}
          isDownloaded={chapter.isDownloaded}
          chapterId={id}
          theme={theme}
          setChapterDownloaded={setChapterDownloaded}
          deleteChapter={deleteChapter}
          downloadChapter={downloadChapter}
        />
      )}
    </Pressable>
  );
};

function areEqual(prev: ChapterItemProps, next: ChapterItemProps) {
  return (
    prev.isSelected === next.isSelected &&
    prev.isDownloading === next.isDownloading &&
    prev.isBookmarked === next.isBookmarked &&
    prev.chapter.unread === next.chapter.unread &&
    prev.chapter.bookmark === next.chapter.bookmark &&
    prev.chapter.isDownloaded === next.chapter.isDownloaded &&
    prev.chapter.progress === next.chapter.progress
  );
}

export default memo(ChapterItem, areEqual);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  text: {
    fontSize: 12,
  },
  unreadIcon: {
    marginRight: 4,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
});
