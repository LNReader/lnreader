import { ChapterItemExtended } from '@database/types';
import { MD3ThemeType } from '@theme/types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { IconButton, Menu, overlay } from 'react-native-paper';

interface DownloadButtonProps {
  downloadQueue: ChapterItemExtended[];
  chapter: ChapterItemExtended;
  theme: MD3ThemeType;
  deleteChapterMenuVisible: boolean;
  deleteChapter: (chapter: ChapterItemExtended) => void;
  downloadChapter: (chapter: ChapterItemExtended) => (dispatch: any) => void;
  hideDeleteChapterMenu: () => void;
  showDeleteChapterMenu: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  downloadQueue,
  chapter,
  theme,
  deleteChapter,
  downloadChapter,
  hideDeleteChapterMenu,
  showDeleteChapterMenu,
  deleteChapterMenuVisible,
}) => {
  const [downloaded, setDownloaded] = useState(chapter.downloaded);
  // React to external changes of chapter download state
  useEffect(() => setDownloaded(chapter.downloaded ? 1 : 0), [chapter]);

  if (downloadQueue.some(chap => chap.chapterId === chapter.chapterId)) {
    return <ChapterDownloadingButton theme={theme} />;
  } else if (downloaded === 0) {
    return (
      <DownloadChapterButton
        theme={theme}
        onPress={() => {
          downloadChapter(chapter);
          setDownloaded(1);
        }}
      />
    );
  } else {
    return (
      <Menu
        visible={deleteChapterMenuVisible}
        onDismiss={hideDeleteChapterMenu}
        anchor={
          <DeleteChapterButton theme={theme} onPress={showDeleteChapterMenu} />
        }
        contentStyle={{ backgroundColor: overlay(2, theme.surface) }}
      >
        <Menu.Item
          onPress={() => {
            deleteChapter(chapter);
            setDownloaded(0);
          }}
          title="Delete"
          titleStyle={{ color: theme.onSurface }}
        />
      </Menu>
    );
  }
};

interface theme {
  theme: MD3ThemeType;
}
type buttonPropType = theme & {
  onPress: () => void;
};
export const ChapterDownloadingButton: React.FC<theme> = ({ theme }) => (
  <ActivityIndicator
    color={theme.outline}
    size={25}
    style={styles.activityIndicator}
  />
);

export const DownloadChapterButton: React.FC<buttonPropType> = ({
  theme,
  onPress,
}) => (
  <IconButton
    icon="arrow-down-circle-outline"
    animated
    iconColor={theme.outline}
    size={25}
    onPress={onPress}
    style={styles.iconButton}
  />
);

export const DeleteChapterButton: React.FC<buttonPropType> = ({
  theme,
  onPress,
}) => (
  <IconButton
    icon="check-circle"
    animated
    iconColor={theme.onSurface}
    size={25}
    onPress={onPress}
    style={styles.iconButton}
  />
);

export const ChapterBookmarkButton: React.FC<theme> = ({ theme }) => (
  <IconButton
    icon="bookmark"
    iconColor={theme.primary}
    size={18}
    style={styles.iconButtonLeft}
  />
);

const styles = StyleSheet.create({
  activityIndicator: { margin: 3.5, padding: 5 },
  iconButton: { margin: 2 },
  iconButtonLeft: { marginLeft: 2 },
});
