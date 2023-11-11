import { useNavigation } from '@react-navigation/native';
import React from 'react';

import { Button } from '@components';
import { useSettings } from '@hooks/reduxHooks';
import { getString } from '@strings/translations';
import { ChapterInfo, NovelInfo } from '@database/types';
import { ChapterScreenProps } from '@navigators/types';

interface ReadButtonProps {
  novel: NovelInfo;
  chapters: ChapterInfo[];
  lastRead: ChapterInfo;
}

const ReadButton = ({ novel, chapters, lastRead }: ReadButtonProps) => {
  const { navigate } = useNavigation<ChapterScreenProps['navigation']>();
  const { useFabForContinueReading = false } = useSettings();

  const navigateToLastReadChapter = () =>
    navigate('Chapter', { novel: novel, chapter: lastRead });

  if (!useFabForContinueReading) {
    return chapters.length > 0 ? (
      <Button
        title={`${getString('novelScreen.continueReading')} ${lastRead.name}`}
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
