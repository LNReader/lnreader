import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';
import { ChapterInfo } from '@database/types';
import { getString } from '@strings/translations';
import { useTheme } from '@providers/Providers';
import { isChapterDownloaded } from '@database/queries/ChapterQueries';

interface ChapterItemProps {
  isDownloading?: boolean;
  isBookmarked?: boolean;
  chapter: ChapterInfo;
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
  isDownloading: isDownloadingProp,
  isBookmarked,
  chapter,
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
  const {
    id,
    name,
    unread,
    releaseTime,
    bookmark,
    chapterNumber,
    progress,
    isDownloaded: isDownloadedProp,
  } = chapter;
  chapter;
  if (name === 'Chapter 2: Rice Farming 101') {
    console.log(name, isDownloadedProp);
  }

  const isBookmarkedLocal = isBookmarked ?? bookmark;

  const theme = useTheme();

  const isDownloaded = useMemo(() => {
    if (!isDownloadingProp) {
      return isChapterDownloaded(id) ?? false;
    }
    return isDownloadedProp;
  }, [id, isDownloadedProp, isDownloadingProp]);

  const highlight = useMemo(
    () => ({ backgroundColor: theme.rippleColor }),
    [theme.rippleColor],
  );

  const pressableStyle = isSelected
    ? [styles.container, highlight]
    : styles.container;

  const titleColour = useMemo(() => {
    if (!unread) return theme.outline;
    return isBookmarkedLocal ? theme.primary : theme.onSurface;
  }, [
    unread,
    isBookmarkedLocal,
    theme.outline,
    theme.primary,
    theme.onSurface,
  ]);

  const updateTitleStyle = useMemo(
    () => ({
      fontSize: 14,
      color: unread ? theme.onSurface : theme.outline,
    }),
    [unread, theme.onSurface, theme.outline],
  );

  const titleStyle = useMemo(
    () => ({
      fontSize: isUpdateCard ? 12 : 14,
      color: titleColour,
      flex: 1,
    }),
    [isUpdateCard, titleColour],
  );

  const metaStyle = useMemo(
    () => [
      styles.text,
      {
        marginTop: 4,
        color: !unread
          ? theme.outline
          : isBookmarkedLocal
          ? theme.primary
          : theme.onSurfaceVariant,
      },
    ],
    [
      unread,
      isBookmarkedLocal,
      theme.outline,
      theme.primary,
      theme.onSurfaceVariant,
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

  // memoize strings so translation lookup / interpolation isn't done every render
  const titleText = useMemo(
    () =>
      showChapterTitles
        ? name
        : getString('novelScreen.chapterChapnum', { num: chapterNumber }),
    [showChapterTitles, name, chapterNumber],
  );

  const progressText = useMemo(
    () => getString('novelScreen.progress', { progress }),
    [progress],
  );

  const handlePress = useCallback(() => {
    if (onSelectPress) {
      onSelectPress(chapter);
    } else {
      navigateToChapter(chapter);
    }
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
      {isBookmarkedLocal ? <ChapterBookmarkButton /> : null}

      <View style={styles.flex1}>
        {isUpdateCard && (
          <Text style={updateTitleStyle} numberOfLines={1}>
            {novelName}
          </Text>
        )}

        <View style={styles.rowCenter}>
          {unread && (
            <View
              style={[styles.unreadDot, { backgroundColor: theme.primary }]}
            />
          )}

          <Text style={titleStyle} numberOfLines={1} ellipsizeMode="tail">
            {titleText}
          </Text>
        </View>

        <View style={styles.rowCenter}>
          {releaseTime && !isUpdateCard && (
            <Text style={metaStyle} numberOfLines={1}>
              {releaseTime}
            </Text>
          )}

          {!isUpdateCard && (progress ?? 0) > 0 && unread && (
            <Text style={progressStyle} numberOfLines={1}>
              {releaseTime ? '•  ' : ''}
              {progressText}
            </Text>
          )}
        </View>
      </View>

      {!isLocal && (
        <DownloadButton
          isDownloading={isDownloadingProp}
          isDownloaded={isDownloaded}
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

// comparator: must include any prop that affects rendering or handlers.
// compare shallowly and include theme color primitives used.
function areEqual(prev: ChapterItemProps, next: ChapterItemProps) {
  const prevBook = prev.isBookmarked ?? prev.chapter.bookmark;
  const nextBook = next.isBookmarked ?? next.chapter.bookmark;

  return (
    prev.isSelected === next.isSelected &&
    prev.isDownloading === next.isDownloading &&
    prevBook === nextBook &&
    prev.chapter.id === next.chapter.id &&
    prev.chapter.name === next.chapter.name &&
    prev.chapter.unread === next.chapter.unread &&
    prev.chapter.bookmark === next.chapter.bookmark &&
    prev.chapter.isDownloaded === next.chapter.isDownloaded &&
    prev.chapter.progress === next.chapter.progress &&
    prev.chapter.releaseTime === next.chapter.releaseTime &&
    prev.chapter.chapterNumber === next.chapter.chapterNumber &&
    prev.showChapterTitles === next.showChapterTitles &&
    prev.isLocal === next.isLocal &&
    prev.isUpdateCard === next.isUpdateCard &&
    prev.novelName === next.novelName &&
    prev.left === next.left &&
    prev.downloadChapter === next.downloadChapter &&
    prev.deleteChapter === next.deleteChapter &&
    prev.setChapterDownloaded === next.setChapterDownloaded &&
    prev.onSelectPress === next.onSelectPress &&
    prev.onSelectLongPress === next.onSelectLongPress &&
    prev.navigateToChapter === next.navigateToChapter
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
});
