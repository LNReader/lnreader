import { openChapter } from '@utils/handleNavigateParams';
import React from 'react';

import { getString } from '../../../../../strings/translations';
import { Button } from '../../../../components';
import { useSettings } from '../../../../hooks/reduxHooks';

const ReadButton = ({ navigation, novel, chapters, theme, lastRead }) => {
  const { useFabForContinueReading = false } = useSettings();

  const navigateToLastReadChapter = () => {
    navigation.navigate('Chapter', openChapter(novel, lastRead));
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
