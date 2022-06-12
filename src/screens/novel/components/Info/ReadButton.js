import React from 'react';
import { StyleSheet } from 'react-native';

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
          textColor={theme.colorButtonText}
          theme={theme}
          onPress={navigateToLastReadChapter}
        />
      ) : (
        <Button
          title={`${
            novel.unread
              ? 'All chapters read'
              : getString('novelScreen.continueReading')
          } ${lastRead.chapterName}`}
          style={{ margin: 16 }}
          color={theme.colorDisabled}
          textColor={theme.colorButtonText}
          theme={theme}
        />
      ))
    );
  } else {
    return null;
  }
};

export default ReadButton;

const styles = StyleSheet.create({
  startButton: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 50,
  },
});
