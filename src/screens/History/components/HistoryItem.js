import React, {useCallback} from 'react';
import {Pressable, StyleSheet, View, Image, Text} from 'react-native';

import moment from 'moment';
import {IconButton} from 'react-native-paper';

import {parseChapterNumber} from '../../../services/utils/helpers';
import {setNovel} from '../../../redux/novel/novel.actions';

const HistoryItem = ({history, theme, dispatch, navigation, deleteHistory}) => {
  const {
    historyId,
    historyTimeRead,
    historyChapterId,
    sourceId,
    novelId,
    novelUrl,
    novelName,
    novelCover,
    chapterName,
    chapterUrl,
    bookmark,
  } = history;

  const getChapterNumber = useCallback(
    () =>
      `Chapter ${parseChapterNumber(chapterName)} • ${moment(historyTimeRead)
        .format('h:mm a')
        .toUpperCase()}`,
    [],
  );

  const navigateToNovel = () => {
    navigation.navigate('Novel', history);
    dispatch(setNovel(history));
  };

  const navigateToChapter = () =>
    navigation.navigate('Chapter', {
      chapterId: historyChapterId,
      chapterUrl,
      sourceId,
      novelUrl,
      novelId,
      chapterName,
      novelName,
      bookmark,
    });

  const getNovelCover = useCallback(
    () =>
      novelCover && !novelCover.startsWith('/')
        ? novelCover
        : 'https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true',
    [],
  );

  return (
    <Pressable
      onPress={navigateToNovel}
      android_ripple={{color: theme.rippleColor}}
    >
      <View style={styles.content}>
        <View style={styles.container}>
          <View>
            <Image source={{uri: getNovelCover()}} style={styles.novelCover} />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[{color: theme.textColorPrimary}, styles.chapterTitle]}
              numberOfLines={2}
            >
              {novelName}
            </Text>
            <Text
              style={[{color: theme.textColorSecondary}, styles.chapterNumber]}
              numberOfLines={1}
            >
              {getChapterNumber()}
            </Text>
          </View>
        </View>
        <View style={styles.buttons}>
          <IconButton
            icon="delete-outline"
            size={24}
            color={theme.textColorPrimary}
            onPress={() => deleteHistory(historyId)}
          />
          <IconButton
            icon="play"
            size={24}
            color={theme.textColorPrimary}
            onPress={navigateToChapter}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default HistoryItem;

const styles = StyleSheet.create({
  content: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  novelCover: {
    height: 80,
    width: 56,
    borderRadius: 4,
  },
  textContainer: {
    flexShrink: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  chapterTitle: {
    fontSize: 15,
    flexWrap: 'wrap',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumber: {
    marginTop: 4,
  },
});
