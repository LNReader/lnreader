import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import color from 'color';

import { Text } from 'react-native-paper';
import { IconButtonV2 } from '../../../components';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemeColors } from '@theme/types';
import { ChapterInfo } from '@database/types';
import { bookmarkChapter } from '@database/queries/ChapterQueries';

interface ReaderAppbarProps {
  novelName: string;
  chapter: ChapterInfo & { chapterText: string };
  theme: ThemeColors;
  goBack: () => void;
  setChapter: (chapter: ChapterInfo & { chapterText: string }) => void;
}

const ReaderAppbar = ({
  novelName,
  chapter,
  goBack,
  theme,
  setChapter,
}: ReaderAppbarProps) => {
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={[
        styles.container,
        {
          paddingTop: (StatusBar.currentHeight || 0) + 8,
          backgroundColor: color(theme.surface).alpha(0.9).string(),
        },
      ]}
    >
      <View style={styles.appbar}>
        <IconButtonV2
          name="arrow-left"
          onPress={goBack}
          color={theme.onSurface}
          size={26}
          theme={theme}
        />
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: theme.onSurface }]}
            numberOfLines={1}
          >
            {novelName}
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {chapter.name}
          </Text>
        </View>
        <IconButtonV2
          name={chapter.bookmark ? 'bookmark' : 'bookmark-outline'}
          size={24}
          onPress={() => {
            bookmarkChapter(chapter.id).then(() =>
              setChapter({
                ...chapter,
                bookmark: !chapter.bookmark,
              }),
            );
          }}
          color={theme.onSurface}
          theme={theme}
          style={styles.bookmark}
        />
      </View>
    </Animated.View>
  );
};

export default ReaderAppbar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    top: 0,
    zIndex: 1,
    paddingBottom: 8,
  },
  appbar: {
    display: 'flex',
    flexDirection: 'row',
  },
  bookmark: {
    marginRight: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
  },
});
