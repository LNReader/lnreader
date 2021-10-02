import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';

import {readerLineHeight, readerTextColor} from '../utils/readerStyles';
import {htmlToText} from '../../../sources/helpers/htmlToText';

const TextReader = ({
  text,
  theme,
  reader,
  chapterName,
  textSelectable,
  nextChapter,
  navigateToNextChapter,
}) => {
  const textStyle = {
    fontSize: reader.textSize,
    color: reader.textColor || readerTextColor(reader.theme),
    lineHeight: readerLineHeight(reader.textSize, reader.lineHeight),
    textAlign: reader.textAlign,
  };

  const fontStyle = reader.fontFamily && {
    fontFamily: reader.fontFamily,
  };

  const chapterText = htmlToText(text);

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: `${reader.padding}%`,
          paddingTop: StatusBar.currentHeight,
        },
      ]}
    >
      <Text style={[textStyle, fontStyle]} selectable={textSelectable}>
        {chapterText}
      </Text>

      <View style={styles.navigationContainer}>
        <Text style={[styles.finishedChapterText, {color: reader.textColor}]}>
          Finished: {chapterName}
        </Text>
        {nextChapter ? (
          <View style={styles.nextChapButtonContainer}>
            <Pressable
              style={styles.nextChapterButton}
              android_ripple={{color: theme.rippleColor}}
              onPress={navigateToNextChapter}
            >
              <Text
                style={[styles.nextChapButtonLabel, {color: reader.textColor}]}
              >
                Next: {nextChapter.chapterName}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[{color: reader.textColor}, styles.noNextChapterText]}>
            There's no next chapter
          </Text>
        )}
      </View>
    </View>
  );
};

export default TextReader;

TextReader.propTypes = {
  text: PropTypes.string,
  reader: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  chapterName: PropTypes.string,
  textSelectable: PropTypes.bool,
  nextChapter: PropTypes.object,
  navigateToNextChapter: PropTypes.func,
};

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
    fontSize: 16,
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
