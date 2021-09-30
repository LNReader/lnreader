import React from 'react';
import {StyleSheet} from 'react-native';

import {Button} from 'react-native-paper';
import {useSettings} from '../../../../hooks/reduxHooks';

const ReadButton = ({navigation, novel, chapters, theme, lastRead}) => {
  const {useFabForContinueReading = false} = useSettings();

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
          color="white"
          style={[{backgroundColor: theme.colorAccent}, styles.startButton]}
          uppercase={false}
          labelStyle={{
            letterSpacing: 0,
            color: theme.colorButtonText,
          }}
          onPress={navigateToLastReadChapter}
        >
          {novel.unread ? `Start reading ` : `Continue reading `}
          {lastRead.chapterName}
        </Button>
      ) : (
        <Button
          color={theme.textColorHint}
          style={[styles.startButton, {backgroundColor: theme.colorDisabled}]}
          uppercase={false}
          labelStyle={{letterSpacing: 0}}
        >
          All chapters read
        </Button>
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
  },
});
