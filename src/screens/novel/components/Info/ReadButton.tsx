import React from 'react';

import { Button } from '@components';
import { getString } from '@strings/translations';
import { ChapterInfo } from '@database/types';
import { useAppSettings } from '@hooks/persisted';
import Animated, { ZoomIn } from 'react-native-reanimated';

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
  const { useFabForContinueReading = false } = useAppSettings();

  const navigateToLastReadChapter = () => {
    if (lastRead) {
      navigateToChapter(lastRead);
    } else if (chapters.length) {
      navigateToChapter(chapters[0]);
    }
  };

  if (!useFabForContinueReading) {
    return chapters.length > 0 || lastRead ? (
      <Animated.View entering={ZoomIn.duration(150)}>
        <Button
          title={
            lastRead
              ? `${getString('novelScreen.continueReading')} ${lastRead.name}`
              : getString('novelScreen.startReadingChapters', {
                  name: chapters[0].name,
                })
          }
          style={{ margin: 16 }}
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
