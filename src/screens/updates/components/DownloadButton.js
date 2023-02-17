import React from 'react';

import { Menu, overlay } from 'react-native-paper';
import {
  ChapterDownloadingButton,
  DeleteChapterButton,
  DownloadChapterButton,
} from '../../novel/components/Chapter/ChapterDownloadButtons';

export const DownloadButton = ({
  downloadQueue,
  theme,
  chapter,
  downloadChapter,
  deleteChapter,
  deleteChapterMenu,
  showDeleteChapterMenu,
  hideDeleteChapterMenu,
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
          onPress={() => {
            deleteChapter(
              chapter.sourceId,
              chapter.novelId,
              chapter.chapterId,
              chapter.chapterName,
            );
            hideDeleteChapterMenu();
          }}
          title="Delete"
          titleStyle={{ color: theme.textColorPrimary }}
        />
      </Menu>
    );
  } else {
    return (
      <DownloadChapterButton
        theme={theme}
        onPress={() =>
          downloadChapter(
            chapter.sourceId,
            chapter.novelUrl,
            chapter.novelId,
            chapter.chapterUrl,
            chapter.chapterName,
            chapter.chapterId,
          )
        }
      />
    );
  }
};
