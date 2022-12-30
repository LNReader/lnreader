import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '@hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import { Button, LoadingScreenV2 } from '@components/index';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getString } from '@strings/translations';
import { useNovel, useSettings, usePreferences } from '@hooks/reduxHooks';
import { useDispatch } from 'react-redux';
import { setNovel, getNovelAction } from '@redux/novel/novel.actions';
import { dividerColor } from '@theme/colors';
import DrawerChapterItem from './DrawerChapterItem';
import { setChapterTitles } from '@utils/parseChapterTitle';
import { openChapter } from '@utils/handleNavigateParams';

const ChapterDrawer = ({ state: st, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStylesheet(theme, insets);
  let listRef = useRef();

  const dispatch = useDispatch();
  const {
    sourceId,
    novelUrl,
    novelName,
    novelId,
    chapterId: currentChapterId,
  } = st.routes[0].params;
  const {
    defaultChapterSort = 'ORDER BY chapterId ASC',
    defaultShowChapterPrefix = true,
    defaultChapterPrefixStyle = ['Volume ', 'Chapter '],
    defaultChapterTitleSeperator = ' - ',
  } = useSettings();

  const {
    sort = defaultChapterSort,
    filter = '',
    showGeneratedChapterTitle = false,
    showChapterPrefix = defaultShowChapterPrefix,
    chapterPrefixStyle = defaultChapterPrefixStyle,
    chapterTitleSeperator = defaultChapterTitleSeperator,
  } = usePreferences(novelId);

  const { chapters: c, novel } = useNovel();
  const [chapters, setChapters] = useState(c);
  useEffect(() => {
    if (chapters.length > 0) {
      setChapters(
        setChapterTitles(
          chapters,
          chapterPrefixStyle,
          showGeneratedChapterTitle,
          showChapterPrefix,
          chapterTitleSeperator,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chapters.length,
    chapterPrefixStyle,
    chapterTitleSeperator,
    showChapterPrefix,
    showGeneratedChapterTitle,
  ]);

  useEffect(() => {
    if (chapters.length < 1 || novelId !== novel.novelId) {
      dispatch(setNovel({ sourceId, novelUrl, novelName, novelId }));
      dispatch(
        getNovelAction(true, sourceId, novelUrl, novelId, sort, filter, 1),
      );
    }
  }, [
    chapters.length,
    defaultChapterSort,
    dispatch,
    filter,
    novel.novelId,
    novelId,
    novelName,
    novelUrl,
    sort,
    sourceId,
  ]);

  const listAscending = sort === 'ORDER BY chapterId ASC';

  const scrollToIndex = useMemo(() => {
    if (chapters.length < 1) {
      return;
    }
    const indexOfCurrentChapter = chapters.findIndex(el => {
      return el.chapterId === currentChapterId;
    });
    let res;
    res = indexOfCurrentChapter >= 2 ? indexOfCurrentChapter - 2 : 0;
    listRef.current?.scrollToIndex?.(res);
    return res;
  }, [chapters, currentChapterId]);
  const [buttonProperties, setButtonProperties] = useState({
    up: {
      text: getString('readerScreen.drawer.scrollToTop'),
      func: () => {
        listRef.current.scrollToIndex({ index: 0, animated: true });
      },
    },
    down: {
      text: getString('readerScreen.drawer.scrollToBottom'),
      func: () => {
        listRef.current.scrollToEnd({
          animated: true,
        });
      },
    },
  });

  const changeChapter = item => {
    navigation.replace(
      'Chapter',
      openChapter({ sourceId, novelUrl, novelName, novelId }, item),
    );
  };
  const renderItem = ({ item }) => {
    return (
      <DrawerChapterItem
        item={item}
        chapterTitle={item.chapterTitle}
        theme={theme}
        currentChapterId={currentChapterId}
        changeChapter={changeChapter}
      />
    );
  };

  const ListFooter = () => {
    return (
      <View style={styles.footer}>
        <Button
          theme={theme}
          style={styles.button}
          title={buttonProperties.up.text}
          labelStyle={styles.btnLabel}
          onPress={buttonProperties.up.func}
        />
        <Button
          theme={theme}
          style={styles.button}
          title={buttonProperties.down.text}
          labelStyle={styles.btnLabel}
          onPress={buttonProperties.down.func}
        />
      </View>
    );
  };
  const checkViewableItems = ({ viewableItems }) => {
    let up = {
      text: getString('readerScreen.drawer.scrollToTop'),
      func: () => {
        listRef.current.scrollToIndex({ index: 0, animated: true });
      },
    };
    let down = {
      text: getString('readerScreen.drawer.scrollToBottom'),
      func: () => {
        listRef.current.scrollToEnd({
          animated: true,
        });
      },
    };
    if (viewableItems.length !== 0) {
      let visible = viewableItems.find(({ item }) => {
        return item.chapterId === currentChapterId;
      });
      if (!visible) {
        if (
          listAscending
            ? viewableItems[0].item.chapterId < currentChapterId
            : viewableItems[0].item.chapterId > currentChapterId
        ) {
          down = {
            text: getString('readerScreen.drawer.scrollToCurrentChapter'),
            func: () => {
              listRef.current.scrollToIndex({
                index: scrollToIndex,
                animated: true,
              });
            },
          };
        } else {
          up = {
            text: getString('readerScreen.drawer.scrollToCurrentChapter'),
            func: () => {
              listRef.current.scrollToIndex({
                index: scrollToIndex,
                animated: true,
              });
            },
          };
        }
      }
      setButtonProperties({
        up: up,
        down: down,
      });
    }
  };
  return (
    <View style={styles.drawer}>
      <Text style={styles.headerCtn}>{getString('common.chapters')}</Text>
      {scrollToIndex !== undefined ? (
        <FlashList
          ref={ref => (listRef.current = ref)}
          onViewableItemsChanged={checkViewableItems}
          data={chapters}
          renderItem={renderItem}
          estimatedItemSize={60}
          initialScrollIndex={scrollToIndex}
        />
      ) : (
        <LoadingScreenV2 theme={theme} />
      )}
      <ListFooter />
    </View>
  );
};

const createStylesheet = (theme, insets) => {
  return StyleSheet.create({
    drawer: {
      flex: 1,
      backgroundColor: theme.surface,
      paddingTop: 48,
    },
    headerCtn: {
      fontSize: 16,
      padding: 16,
      marginBottom: 4,
      fontWeight: 'bold',
      borderBottomWidth: 1,
      borderBottomColor: dividerColor(theme.isDark),
      color: theme.textColorPrimary,
    },
    button: {
      marginBottom: 12,
      marginHorizontal: 16,
      marginTop: 4,
    },
    footer: {
      marginTop: 4,
      paddingTop: 8,
      paddingBottom: insets.bottom,
      borderTopWidth: 1,
      borderTopColor: dividerColor(theme.isDark),
    },
    btnLabel: {
      fontWeight: 'bold',
    },
  });
};

export default ChapterDrawer;
