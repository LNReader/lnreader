import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import sanitizeHtml from 'sanitize-html';

import { Button } from '../../../components';
import { ThemeTypeV1 } from '../../../theme/v1/theme/types';
import { ChapterItem } from '../../../database/types';
import { readerBackground } from '../utils/readerStyles';

interface TextReaderProps {
  text: string;
  theme: ThemeTypeV1;
  reader: {
    theme: number | string;
    textColor: string;
    textSize: number;
    textAlign: string;
    padding: number;
    fontFamily: string;
    lineHeight: number;
    customCSS: string;
  };
  chapterName: string;
  nextChapter: ChapterItem;
  navigateToNextChapter: () => void;
}

const TextReader: React.FC<TextReaderProps> = ({
  text,
  theme,
  reader,
  chapterName,
  nextChapter,
  navigateToNextChapter,
}) => {
  const { width } = useWindowDimensions();

  const html = sanitizeHtml(text, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: { 'img': ['src'] },
    allowedSchemes: ['data', 'http', 'https'],
  });

  return (
    <>
      <RenderHtml
        contentWidth={width}
        source={{ html }}
        defaultTextProps={{
          style: {
            color: reader.textColor,
            fontFamily: reader.fontFamily,
            lineHeight: reader.textSize * reader.lineHeight,
            fontSize: reader.textSize,
          },
          selectable: true,
        }}
        defaultViewProps={{
          style: {
            backgroundColor: readerBackground(reader.theme),
          },
        }}
        baseStyle={{
          paddingHorizontal: `${reader.padding}%`,
          paddingTop: (StatusBar.currentHeight || 0) + 16,
        }}
      />
      <View style={styles.navigationContainer}>
        <Text style={[styles.finishedChapterText, { color: reader.textColor }]}>
          Finished: {chapterName}
        </Text>
        {nextChapter ? (
          <Button
            title={`Next: ${nextChapter.chapterName}`}
            onPress={navigateToNextChapter}
            theme={theme}
            margin={16}
          />
        ) : (
          <Text style={[{ color: reader.textColor }, styles.noNextChapterText]}>
            There's no next chapter
          </Text>
        )}
      </View>
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
    paddingVertical: 8,
    textAlign: 'center',
  },
});
