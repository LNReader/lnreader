import React from 'react';

import { Button } from '@components';
import { getString } from '@strings/translations';
import { ChapterInfo } from '@database/types';
import { useAppSettings } from '@hooks/persisted';

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
    return chapters.length > 0 ? (
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
    ) : null;
  } else {
    return null;
  }
};

export default ReadButton;
