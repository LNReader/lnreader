import React from 'react';

import { Button } from '@components';
import { getString } from '@strings/translations';
import { ChapterInfo } from '@database/types';
import { useAppSettings } from '@hooks/persisted';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useNovelContext } from '@screens/novel/NovelContext';

interface ReadButtonProps {
  chapters: ChapterInfo[];
  lastRead?: ChapterInfo;
  navigateToChapter: (chapter: ChapterInfo) => void;
}

const ReadButton = ({
  chapters,
  lastRead,
  navigateToChapter,
}: ReadButtonProps) => {
  const { useFabForContinueReading = false, showChapterTitles: showChapterTitlesAppWide } = useAppSettings();
  const { novelSettings: { showChapterTitles = showChapterTitlesAppWide } } = useNovelContext();

  const navigateToLastReadChapter = () => {
    if (lastRead) {
      navigateToChapter(lastRead);
    } else if (chapters.length) {
      navigateToChapter(chapters[0]);
    }
  };

  const chapterToDisplay = lastRead ?? chapters[0];
  const showThisChapterTitle = chapterToDisplay && (
    showChapterTitles === 'always' || (
      showChapterTitles === 'read' && !chapterToDisplay.unread
    )
  );
  const chapterNameOrNum = chapterToDisplay && (showThisChapterTitle ?
    chapterToDisplay.name :
    getString('novelScreen.chapterChapnum', {
      num: chapterToDisplay.chapterNumber
    }));

  if (!useFabForContinueReading) {
    return chapterToDisplay ? (
      <Animated.View entering={ZoomIn.duration(150)}>
        <Button
          title={
            lastRead
              ? `${getString('novelScreen.continueReading')} ${chapterNameOrNum}`
              : getString('novelScreen.startReadingChapters', {
                  name: chapterNameOrNum,
                })
          }
          style={styles.margin}
          onPress={navigateToLastReadChapter}
          mode="contained"
        />
      </Animated.View>
    ) : null;
  } else {
    return null;
  }
};

export default ReadButton;

const styles = StyleSheet.create({
  margin: { margin: 16 },
});
