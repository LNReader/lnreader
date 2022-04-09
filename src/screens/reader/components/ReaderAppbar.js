import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Appbar } from 'react-native-paper';
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
          { backgroundColor: `${theme.colorPrimary}E6` },
          styles.appbarContainer,
        ]}
      >
        <Appbar.Header style={styles.appbar}>
          <IconButtonV2
            name="arrow-left"
            onPress={goBack}
            color={theme.textColorPrimary}
            size={26}
            theme={theme}
          />
          <Appbar.Content
            title={novelName}
            titleStyle={{ color: theme.textColorPrimary }}
            subtitle={chapterName}
            subtitleStyle={{ color: theme.textColorSecondary }}
          />
          <Appbar.Action
            icon="volume-high"
            size={24}
            onPress={tts}
            color={
              textToSpeech === 'progress'
                ? theme.colorAccent
                : theme.textColorPrimary
            }
          />
          {textToSpeechPosition.end > 0 && (
            <Appbar.Action
              icon={textToSpeech === 'paused' ? 'play' : 'pause'}
              size={24}
              onPress={pauseTts}
              color={theme.textColorPrimary}
            />
          )}

          <IconButtonV2
            icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            onPress={() => {
              dispatch(bookmarkChapterAction([{ bookmark, chapterId }]));
              setBookmarked(!bookmarked);
            }}
            color={theme.textColorPrimary}
            theme={theme}
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
});
