import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppSettings, useTheme } from '@hooks/persisted';
import { FlashList, ViewToken } from '@shopify/flash-list';
import { LoadingScreenV2 } from '@components/index';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getString } from '@strings/translations';
import { ChapterScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import { ThemeColors } from '@theme/types';
import { NovelSettings } from '@hooks/persisted/useNovel';
import ListFooter from './ListFooter';
import renderListChapter from './RenderListChapter';

type ChapterDrawerProps = ChapterScreenProps & {
  chapters: ChapterInfo[];
  novelSettings: NovelSettings;
  pages: string[];
  setPageIndex: (value: number) => void;
};

const ChapterDrawer = ({
  route,
  navigation,
  chapters,
  novelSettings,
  pages,
  setPageIndex,
}: ChapterDrawerProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStylesheet(theme, insets);
  const listRef = useRef<FlashList<ChapterInfo>>(null);
  const { chapter, novel: novelItem } = route.params;
  const { defaultChapterSort } = useAppSettings();
  const { sort = defaultChapterSort } = novelSettings;

  const listAscending = sort === 'ORDER BY position ASC';

  const scrollToIndex = useMemo(() => {
    if (chapters.length < 1) {
      return;
    }
    const indexOfCurrentChapter =
      chapters.findIndex(el => {
        return el.id === chapter.id;
      }) || 0;
    let res = indexOfCurrentChapter >= 2 ? indexOfCurrentChapter - 2 : 0;

    return res;
  }, [chapters, chapter.id]);

  const [buttonProperties, setButtonProperties] = useState({
    up: {
      text: getString('readerScreen.drawer.scrollToTop'),
      func: () => {
        listRef.current?.scrollToIndex({ index: 0, animated: true });
      },
    },
    down: {
      text: getString('readerScreen.drawer.scrollToBottom'),
      func: () => {
        listRef.current?.scrollToEnd({
          animated: true,
        });
      },
    },
  });

  const checkViewableItems = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    let up = {
      text: getString('readerScreen.drawer.scrollToTop'),
      func: () => {
        listRef.current?.scrollToIndex({ index: 0, animated: true });
      },
    };
    let down = {
      text: getString('readerScreen.drawer.scrollToBottom'),
      func: () => {
        listRef.current?.scrollToEnd({
          animated: true,
        });
      },
    };
    if (viewableItems.length !== 0) {
      let visible = viewableItems.find(({ item }) => {
        return item.id === chapter.id;
      });
      if (!visible && scrollToIndex) {
        if (
          listAscending
            ? (viewableItems[0].index ?? 0) < (chapter.position ?? 0)
            : (viewableItems[0].index ?? 0) > (chapter.position ?? 0)
        ) {
          down = {
            text: getString('readerScreen.drawer.scrollToCurrentChapter'),
            func: () => {
              listRef.current?.scrollToIndex({
                index: scrollToIndex,
                animated: true,
              });
            },
          };
        } else {
          up = {
            text: getString('readerScreen.drawer.scrollToCurrentChapter'),
            func: () => {
              listRef.current?.scrollToIndex({
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

  useEffect(() => {
    let pageIndex = pages.indexOf(chapter.page);
    if (pageIndex === -1) {
      pageIndex = 0;
    }
    setPageIndex(pageIndex);
  }, [chapter, pages, setPageIndex]);
  return (
    <View style={styles.drawer}>
      <Text style={styles.headerCtn}>{getString('common.chapters')}</Text>
      {scrollToIndex !== undefined ? (
        <FlashList
          ref={listRef}
          onViewableItemsChanged={checkViewableItems}
          data={chapters}
          renderItem={val =>
            renderListChapter({
              item: val.item,
              novelItem,
              styles,
              theme,
              navigation,
              chapterId: chapter.id,
            })
          }
          estimatedItemSize={60}
          initialScrollIndex={scrollToIndex}
        />
      ) : (
        <LoadingScreenV2 theme={theme} />
      )}
      <ListFooter styles={styles} buttonProperties={buttonProperties} />
    </View>
  );
};

const createStylesheet = (theme: ThemeColors, insets: EdgeInsets) => {
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
      borderBottomColor: theme.outline,
      color: theme.onSurface,
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
      color: theme.onSurface,
    },
    releaseDateCtn: {
      fontSize: 10,
      color: theme.onSurfaceVariant,
    },
    drawerElementContainer: {
      margin: 4,
      marginLeft: 16,
      marginRight: 16,
      borderRadius: 50,
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
      borderTopColor: theme.outline,
    },
  });
};

export default ChapterDrawer;
