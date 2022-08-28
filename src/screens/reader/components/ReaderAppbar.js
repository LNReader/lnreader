import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import color from 'color';

import { Appbar, Text } from 'react-native-paper';
import { IconButtonV2 } from '../../../components';
import FadeView from '../../../components/Common/CrossFadeView';
import { bookmarkChapterAction } from '../../../redux/novel/novel.actions';

const ReaderAppbar = ({
  bookmark,
  novelName,
  chapterId,
  chapterName,
  hide,
  dispatch,
  tts,
  textToSpeech,
  theme,
  textToSpeechPosition,
  pauseTts,
}) => {
  const { goBack } = useNavigation();
  const [bookmarked, setBookmarked] = useState(bookmark);

  return (
    <FadeView style={styles.container} active={hide} animationDuration={150}>
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
              style={[styles.title, { color: theme.textColorPrimary }]}
              numberOfLines={1}
            >
              {novelName}
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.textColorSecondary }]}
              numberOfLines={1}
            >
              {chapterName}
            </Text>
          </View>
          <Appbar.Action
            icon="volume-high"
            size={24}
            onPress={tts}
            iconColor={
              textToSpeech === 'progress' ? theme.primary : theme.onSurface
            }
          />
          {textToSpeechPosition.end > 0 && (
            <Appbar.Action
              icon={textToSpeech === 'paused' ? 'play' : 'pause'}
              size={24}
              onPress={pauseTts}
              iconColor={theme.onSurface}
            />
          )}

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
    </FadeView>
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
