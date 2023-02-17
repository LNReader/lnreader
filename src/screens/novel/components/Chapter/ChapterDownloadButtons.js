import React from 'react';
import { ActivityIndicator } from 'react-native';

import { IconButton, Menu, overlay } from 'react-native-paper';

export const DownloadButton = ({
  downloadQueue,
  chapter,
  theme,
  deleteChapter,
  downloadChapter,
  hideDeleteChapterMenu,
  showDeleteChapterMenu,
  deleteChapterMenu,
}) => {
  if (downloadQueue.some(chap => chap.chapterId === chapter.chapterId)) {
    return <ChapterDownloadingButton theme={theme} />;
  } else if (chapter.downloaded === 1) {
    return (
      <Menu
        visible={deleteChapterMenu}
        onDismiss={hideDeleteChapterMenu}
        anchor={
          <DeleteChapterButton theme={theme} onPress={showDeleteChapterMenu} />
        }
        contentStyle={{ backgroundColor: overlay(2, theme.surface) }}
      >
        <Menu.Item
          onPress={() => deleteChapter(chapter.chapterId, chapter.chapterName)}
          title="Delete"
          titleStyle={{ color: theme.onSurface }}
        />
      </Menu>
    );
  } else {
    return (
      <DownloadChapterButton
        theme={theme}
        onPress={() =>
          downloadChapter(
            chapter.chapterUrl,
            chapter.chapterName,
            chapter.chapterId,
          )
        }
      />
    );
  }
};

export const ChapterDownloadingButton = ({ theme }) => (
  <ActivityIndicator
    color={theme.outline}
    size={25}
    style={{ margin: 3.5, padding: 5 }}
  />
);

export const DownloadChapterButton = ({ theme, onPress }) => (
  <IconButton
    icon="arrow-down-circle-outline"
    animated
    iconColor={theme.outline}
    size={25}
    onPress={onPress}
    style={{ margin: 2 }}
  />
);

export const DeleteChapterButton = ({ theme, onPress }) => (
  <IconButton
    icon="check-circle"
    animated
    iconColor={theme.onSurface}
    size={25}
    onPress={onPress}
    style={{ margin: 2 }}
  />
);

export const ChapterBookmarkButton = ({ theme }) => (
  <IconButton
    icon="bookmark"
    iconColor={theme.primary}
    size={18}
    style={{ marginLeft: 2 }}
  />
);
