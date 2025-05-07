import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppSettings, useTheme } from '@hooks/persisted';
import { Button, LoadingScreenV2 } from '@components/index';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import renderListChapter from './RenderListChapter';
import { useChapterContext } from '@screens/reader/ChapterContext';
import { useNovelContext } from '@screens/novel/NovelContext';
import { FlashList, ViewToken } from '@shopify/flash-list';
import { ChapterInfo } from '@database/types';

type ButtonProperties = {
  text: string;
  index?: number;
};

type ButtonsProperties = {
  up: ButtonProperties;
  down: ButtonProperties;
};

const ChapterDrawer = () => {
  const { chapter, setChapter, setLoading } = useChapterContext();
  const { chapters, novelSettings, pages, setPageIndex } = useNovelContext();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { defaultChapterSort } = useAppSettings();
  const listRef = useRef<FlashList<ChapterInfo> | null>(null);

  const styles = createStylesheet(theme, insets);

  const { sort = defaultChapterSort } = novelSettings;
  const listAscending = sort === 'ORDER BY position ASC';

  const defaultButtonLayout: ButtonsProperties = useMemo(
    () => ({
      up: {
        text: getString('readerScreen.drawer.scrollToTop'),
        index: 0,
      },
      down: {
        text: getString('readerScreen.drawer.scrollToBottom'),
        index: undefined,
      },
    }),
    [],
  );

  useEffect(() => {
    let pageIndex = pages.indexOf(chapter.page);
    if (pageIndex === -1) {
      pageIndex = 0;
    }
    setPageIndex(pageIndex);
  }, [chapter, pages, setPageIndex]);

  const calculateScrollToIndex = useCallback(() => {
    if (chapters.length < 1) {
      return;
    }

    const indexOfCurrentChapter =
      chapters.findIndex(el => {
        return el.id === chapter.id;
      }) || 0;

    return indexOfCurrentChapter >= 2 ? indexOfCurrentChapter - 2 : 0;
  }, [chapters, chapter.id]);

  const scrollToIndex = useRef<number | undefined>(calculateScrollToIndex());

  const [footerBtnProps, setButtonProperties] =
    useState<ButtonsProperties>(defaultButtonLayout);

  const checkViewableItems = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const curChapter = getString(
        'readerScreen.drawer.scrollToCurrentChapter',
      );
      const newBtnLayout = Object.create(defaultButtonLayout);

      if (viewableItems.length === 0) return;
      const cKey = (scrollToIndex.current ?? 0) + 2;
      const vKey = parseInt(viewableItems[0].key, 10);
      const visible = vKey <= cKey && cKey <= vKey + viewableItems.length - 1;

      if (!visible && scrollToIndex.current !== undefined) {
        if (
          listAscending
            ? (viewableItems[0].index ?? 0) < scrollToIndex.current + 2
            : (viewableItems[0].index ?? 0) > scrollToIndex.current + 2
        ) {
          newBtnLayout.down = {
            text: curChapter,
            index: scrollToIndex.current,
          };
        } else {
          newBtnLayout.up = {
            text: curChapter,
            index: scrollToIndex.current,
          };
        }
      }
      if (cKey <= 2 && vKey <= 4) {
        newBtnLayout.up = {
          text: curChapter,
          index: scrollToIndex.current,
        };
      }
      setButtonProperties(newBtnLayout);
    },
    [defaultButtonLayout, listAscending],
  );
  const scroll = useCallback((index?: number) => {
    if (index !== undefined) {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    } else {
      listRef.current?.scrollToEnd({
        animated: true,
      });
    }
  }, []);

  useEffect(() => {
    const next = calculateScrollToIndex();
    if (next !== undefined) {
      if (scrollToIndex.current === undefined) {
        scroll(next);
      }
      scrollToIndex.current = next;
    }
  }, [chapters, chapter.id, calculateScrollToIndex, scroll]);

  return (
    <View style={styles.drawer}>
      <Text style={styles.headerCtn}>{getString('common.chapters')}</Text>
      {scrollToIndex === undefined ? (
        <LoadingScreenV2 theme={theme} />
      ) : (
        <FlashList
          ref={listRef}
          viewabilityConfig={{
            minimumViewTime: 100,
            viewAreaCoveragePercentThreshold: 95,
          }}
          onViewableItemsChanged={checkViewableItems}
          data={chapters}
          extraData={[chapter, scrollToIndex.current]}
          keyExtractor={item => (item.position ?? item.id).toString()}
          renderItem={val =>
            renderListChapter({
              item: val.item,
              styles,
              theme,
              chapterId: chapter.id,
              onPress: () => {
                setLoading(true);
                setChapter(val.item);
              },
            })
          }
          estimatedItemSize={60}
          initialScrollIndex={scrollToIndex.current}
        />
      )}
      <View style={styles.footer}>
        <Button
          mode="contained"
          style={styles.button}
          title={footerBtnProps.up.text}
          onPress={() => scroll(footerBtnProps.up.index)}
        />
        <Button
          mode="contained"
          style={styles.button}
          title={footerBtnProps.down.text}
          onPress={() => scroll(footerBtnProps.down.index)}
        />
      </View>
    </View>
  );
};

const createStylesheet = (theme: ThemeColors, insets: EdgeInsets) => {
  return StyleSheet.create({
    button: {
      marginBottom: 12,
      marginHorizontal: 16,
      marginTop: 4,
    },
    chapterCtn: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    chapterNameCtn: {
      color: theme.onSurface,
      fontSize: 12,
      marginBottom: 2,
    },
    drawer: {
      backgroundColor: theme.surface,
      flex: 1,
      paddingTop: 48,
    },
    drawerElementContainer: {
      borderRadius: 50,
      margin: 4,
      marginLeft: 16,
      marginRight: 16,
      minHeight: 48,
      overflow: 'hidden',
    },
    footer: {
      borderTopColor: theme.outline,
      borderTopWidth: 1,
      marginTop: 4,
      paddingBottom: insets.bottom,
      paddingTop: 8,
    },
    headerCtn: {
      borderBottomColor: theme.outline,
      borderBottomWidth: 1,
      color: theme.onSurface,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
      padding: 16,
    },
    releaseDateCtn: {
      color: theme.onSurfaceVariant,
      fontSize: 10,
    },
  });
};

export default ChapterDrawer;
