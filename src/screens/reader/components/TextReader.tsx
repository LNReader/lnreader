import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

import { TextAlignments } from '@screens/settings/SettingsReaderScreen/SettingsReaderScreen';
import { Button } from '@components/index';
import { MD3ThemeType } from '../../../theme/types';
import { ChapterItem } from '../../../database/types';
import { getString } from '@strings/translations';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface TextReaderProps {
  theme: MD3ThemeType;
  chapterName: string;
  text: string;
  reader: {
    theme: string;
    textColor: string;
    textSize: number;
    textAlign: string;
    padding: number;
    fontFamily: string;
    lineHeight: number;
    customCSS: string;
  };
  nextChapter: ChapterItem;
  onPress(): void;
  navigateToNextChapter: () => void;
}

const TextReader: React.FC<TextReaderProps> = ({
  text,
  theme,
  chapterName,
  reader,
  nextChapter,
  onPress,
  navigateToNextChapter,
}) => {
  const { width, height } = useWindowDimensions();

  return (
    <>
      <TouchableWithoutFeedback onPress={onPress}>
        <RenderHtml
          contentWidth={width}
          source={{ html: text }}
          defaultTextProps={{
            style: {
              color: reader.textColor,
              fontFamily: reader.fontFamily,
              lineHeight: reader.textSize * reader.lineHeight,
              fontSize: reader.textSize,
              textAlign: reader.textAlign as TextAlignments,
            },
          }}
          defaultViewProps={{
            style: {
              backgroundColor: reader.theme,
            },
          }}
          baseStyle={{
            paddingHorizontal: `${reader.padding}%`,
            paddingTop: (StatusBar.currentHeight || 0) + 16,
            minHeight: height - 100,
          }}
        />
        <View style={styles.navigationContainer}>
          <Text
            style={[styles.finishedChapterText, { color: reader.textColor }]}
          >
            {`${getString('readerScreen.finished')}: ${chapterName?.trim()}`}
          </Text>
          {nextChapter ? (
            <Button
              title={`Next: ${nextChapter.chapterName}`}
              onPress={navigateToNextChapter}
              theme={theme}
              textColor={theme.colorButtonText} // what is this prop ?
              style={styles.nextButton}
            />
          ) : (
            <Text
              style={[{ color: reader.textColor }, styles.noNextChapterText]}
            >
              {getString('readerScreen.noNextChapter')}
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default TextReader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  navigationContainer: {
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  finishedChapterText: {
    textAlign: 'center',
  },
  nextChapButtonContainer: {
    borderRadius: 8,
    marginVertical: 4,
    overflow: 'hidden',
  },
  nextChapterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextChapButtonLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  noNextChapterText: {
    fontSize: 16,
    paddingVertical: 16,
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
