import { MD3ThemeType } from '@theme/types';
import { openChapter } from '@utils/handleNavigateParams';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { getString } from '../../../../../strings/translations';
import { Button } from '../../../../components';
import { useSettings } from '../../../../hooks/reduxHooks';
import { ChapterItem, NovelInfo } from '@database/types';

type ReadButtonProps = {
  navigation: NavigationProp<ParamListBase>;
  novel: NovelInfo;
  chaptersLength: number;
  lastRead: ChapterItem;
  chapterTitle: string;
  theme: MD3ThemeType;
};

const ReadButton: React.FC<ReadButtonProps> = ({
  navigation,
  novel,
  chaptersLength,
  lastRead,
  chapterTitle,
  theme,
}) => {
  const { useFabForContinueReading = false } = useSettings();

  const navigateToLastReadChapter = () => {
    navigation.navigate('Chapter', openChapter(novel, lastRead));
  };

  if (useFabForContinueReading) {
    return null;
  }
  return (
    <>
      {chaptersLength > 0 &&
        (lastRead ? (
          <Button
            title={`${
              novel.unread
                ? 'Start reading'
                : getString('novelScreen.continueReading')
            } ${chapterTitle}`}
            style={styles.margin}
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
            } ${chapterTitle}`}
            style={styles.margin}
            theme={theme}
          />
        ))}
    </>
  );
};

const styles = StyleSheet.create({
  margin: {
    margin: 16,
  },
});

export default ReadButton;
