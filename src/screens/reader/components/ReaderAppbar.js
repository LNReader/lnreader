import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import color from 'color';

import { Appbar, Text } from 'react-native-paper';
import { IconButtonV2 } from '../../../components';
import { bookmarkChapterAction } from '../../../redux/novel/novel.actions';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAppDispatch } from '@redux/hooks';

const ReaderAppbar = ({
  bookmark,
  novelName,
  chapterId,
  chapterName,
  tts,
  textToSpeech,
  theme,
}) => {
  const dispatch = useAppDispatch();
  const { goBack } = useNavigation();
  const [bookmarked, setBookmarked] = useState(bookmark);

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      <View
        style={[
          { backgroundColor: color(theme.surface).alpha(0.9).string() },
          styles.appbarContainer,
        ]}
      >
        <Appbar.Header style={styles.appbar}>
          <IconButtonV2
            name="arrow-left"
            onPress={goBack}
            iconColor={theme.onSurface}
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
              {chapterName}
            </Text>
          </View>
          <Appbar.Action
            icon={textToSpeech === 'progress' ? 'pause' : 'volume-high'}
            size={24}
            onPress={tts}
            iconColor={
              textToSpeech === 'progress' ? theme.primary : theme.onSurface
            }
          />

          <IconButtonV2
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            onPress={() => {
              dispatch(bookmarkChapterAction([{ bookmark, chapterId }]));
              setBookmarked(!bookmarked);
            }}
            iconColor={theme.onSurface}
            theme={theme}
            style={styles.bookmark}
          />
        </Appbar.Header>
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
  },
  appbarContainer: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
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
