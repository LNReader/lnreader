import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import color from 'color';
import { useTheme } from '@hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import { Button, LoadingScreenV2 } from '@components/index';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getString } from '@strings/translations';
import { useNovel, useSettings, usePreferences } from '@hooks/reduxHooks';
import { useDispatch } from 'react-redux';
import { setNovel, getNovelAction } from '@redux/novel/novel.actions';
import { dividerColor } from '@theme/colors';

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
  const { defaultChapterSort = 'ORDER BY chapterId ASC' } = useSettings();
  const { sort = defaultChapterSort, filter = '' } = usePreferences(novelId);
  const { chapters, novel } = useNovel();
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
  }, [chapters, currentChapterId, listAscending]);
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
    navigation.replace('Chapter', {
      sourceId,
      novelUrl,
      novelName,
      novelId,
      ...item,
    });
  };
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.drawerElementContainer,
        item.chapterId === currentChapterId && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
        onPress={() => changeChapter(item)}
        style={styles.chapterCtn}
      >
        <Text numberOfLines={1} style={styles.chapterNameCtn}>
          {item.chapterName}
        </Text>
        {item.releaseDate && (
          <Text style={styles.releaseDateCtn}>{item.releaseDate}</Text>
        )}
      </Pressable>
    </View>
  );

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
    chapterCtn: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 10,
      justifyContent: 'center',
    },
    chapterNameCtn: {
      fontSize: 12,
      marginBottom: 2,
      color: theme.textColorPrimary,
    },
    releaseDateCtn: {
      fontSize: 10,
      color: theme.textColorSecondary,
    },
    drawerElementContainer: {
      margin: 4,
      marginLeft: 0,
      marginRight: 16,
      borderTopRightRadius: 50,
      borderBottomRightRadius: 50,
      overflow: 'hidden',
      minHeight: 48,
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
