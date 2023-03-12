import { useNavigation } from '@react-navigation/native';
import React from 'react';

import { Button } from '@components';
import { useSettings } from '@hooks/reduxHooks';
import { getString } from '@strings/translations';

const ReadButton = ({ novel, chapters, lastRead }) => {
  const { navigate } = useNavigation();
  const { useFabForContinueReading = false } = useSettings();

  const navigateToLastReadChapter = () =>
    navigate('Chapter', { novel: novel, chapter: lastRead });

  if (!useFabForContinueReading) {
    return (
      chapters.length > 0 &&
      (lastRead ? (
        <Button
          title={`${
            novel.unread
              ? 'Start reading'
              : getString('novelScreen.continueReading')
          } ${lastRead.name}`}
          style={{ margin: 16 }}
          onPress={navigateToLastReadChapter}
          mode="contained"
        />
      ) : (
        <Button
          disabled
          title={`${
            novel.unread
              ? 'All chapters read'
              : getString('novelScreen.continueReading')
          } ${lastRead.name}`}
          style={{ margin: 16 }}
          mode="contained"
        />
      ))
    );
  } else {
    return null;
  }
};

export default ReadButton;
