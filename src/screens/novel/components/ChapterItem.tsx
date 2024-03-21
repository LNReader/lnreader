import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import color from 'color';
import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';
import { ThemeColors } from '@theme/types';
import { ChapterInfo } from '@database/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getString } from '@strings/translations';
import { useBoolean } from '@hooks';

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
  left?: ReactNode;
  isLocal: boolean;
  isUpdateCard?: boolean;
  novelName?: string;
  heading?: string;
  description?: string;
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
  isLocal,
  left,
  isUpdateCard,
  novelName,
  heading,
  description,
}) => {
  const { id, name, unread, releaseTime, bookmark, chapterNumber, progress } =
    chapter;
  const {
    value: isMenuVisible,
    setTrue: showMenu,
    setFalse: hideMenu,
  } = useBoolean();
  const title =
    heading ??
    (showChapterTitles
      ? name
      : getString('novelScreen.chapterChapnum', {
          num: chapterNumber,
        }));

  const subtitle = description ?? releaseTime;

  let textColor;
  if (isUpdateCard) {
    textColor = theme.onBackground;
  } else {
    textColor = !unread
      ? theme.outline
      : bookmark
      ? theme.primary
      : theme.onSurfaceVariant;
  }
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
      <View style={styles.row}>
        {left}
        {bookmark ? <ChapterBookmarkButton theme={theme} /> : null}
        <View style={{ flex: 1 }}>
          {novelName && (
            <Text
              style={[
                {
                  fontSize: 14,
                  color: theme.onBackground,
                },
              ]}
              numberOfLines={1}
            >
              {novelName}
            </Text>
          ) : null}
          <View style={styles.row}>
            {unread && !heading ? (
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
                  fontSize: 14,
                  color: textColor,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {releaseTime && !isUpdateCard ? (
              <Text
                style={[
                  {
                    color: textColor,
                  },
                  styles.text,
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
            {!isUpdateCard && progress && progress > 0 && unread ? (
              <Text
                style={{
                  color: theme.outline,
                  fontSize: 12,
                  marginLeft: releaseTime ? 5 : 0,
                }}
                numberOfLines={1}
              >
                {releaseTime ? '•  ' : null}
                {getString('novelScreen.progress', { progress })}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      {!isLocal ? (
        <DownloadButton
          isDownloading={isDownloading}
          isDownloaded={chapter.isDownloaded}
          theme={theme}
          deleteChapter={deleteChapter}
          downloadChapter={downloadChapter}
          hideDeleteChapterMenu={hideMenu}
          showDeleteChapterMenu={showMenu}
          deleteChapterMenuVisible={isMenuVisible}
        />
      ) : null}
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
  },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  unreadIcon: {
    marginRight: 4,
  },
});
