import React from 'react';

import { getString } from '../../../../../strings/translations';
import { Button } from '../../../../components';
import { useSettings } from '../../../../hooks/reduxHooks';

const ReadButton = ({ navigation, novel, chapters, theme, lastRead }) => {
  const { useFabForContinueReading = false } = useSettings();

  const navigateToLastReadChapter = () => {
    navigation.navigate('Chapter', {
      chapterId: lastRead.chapterId,
      chapterUrl: lastRead.chapterUrl,
      novelUrl: novel.novelUrl,
      novelId: lastRead.novelId,
      sourceId: novel.sourceId,
      chapterName: lastRead.chapterName,
      novelName: novel.novelName,
      bookmark: lastRead.bookmark,
    });
  };

  if (!useFabForContinueReading) {
    return (
      chapters.length > 0 &&
      (lastRead ? (
        <Button
          title={`${
            novel.unread
              ? 'Start reading'
              : getString('novelScreen.continueReading')
          } ${lastRead.chapterName}`}
          style={{ margin: 16 }}
          theme={theme}
          onPress={navigateToLastReadChapter}
        />
      ) : (
        <Button
          disabled
          title={`${
            novel.unread
              ? 'All chapters read'
              : getString('novelScreen.continueReading')
          } ${lastRead.chapterName}`}
          style={{ margin: 16 }}
          theme={theme}
        />
      ))
    );
  } else {
    return null;
  }
};

export default ReadButton;
