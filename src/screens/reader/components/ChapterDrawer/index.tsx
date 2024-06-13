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
import { FlashList, ViewToken } from '@shopify/flash-list';
import { Button, LoadingScreenV2 } from '@components/index';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getString } from '@strings/translations';
import { ChapterScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import { ThemeColors } from '@theme/types';
import { NovelSettings } from '@hooks/persisted/useNovel';
import renderListChapter from './RenderListChapter';

type ChapterDrawerProps = ChapterScreenProps & {
  chapters: ChapterInfo[];
  novelSettings: NovelSettings;
  pages: string[];
  setPageIndex: (value: number) => void;
};
type ButtonProperties = {
  text: string;
  index?: number;
};

type ButtonsProperties = {
  up: ButtonProperties;
  down: ButtonProperties;
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
  const { defaultChapterSort } = useAppSettings();
  const listRef = useRef<FlashList<ChapterInfo>>(null);

  const styles = createStylesheet(theme, insets);

  const { chapter, novel: novelItem } = route.params;
  const { sort = defaultChapterSort } = novelSettings;
  const listAscending = sort === 'ORDER BY position ASC';

  const defaultButtonLayout: ButtonsProperties = {
    up: {
      text: getString('readerScreen.drawer.scrollToTop'),
      index: 0,
    },
    down: {
      text: getString('readerScreen.drawer.scrollToBottom'),
      index: undefined,
    },
  };

  useEffect(() => {
    let pageIndex = pages.indexOf(chapter.page);
    if (pageIndex === -1) {
      pageIndex = 0;
    }
    setPageIndex(pageIndex);
  }, [chapter, pages, setPageIndex]);

  const scrollToIndex = useMemo(() => {
    if (chapters.length < 1) {
      return;
    }

    const indexOfCurrentChapter =
      chapters.findIndex(el => {
        return el.id === chapter.id;
      }) || 0;
    return indexOfCurrentChapter >= 2 ? indexOfCurrentChapter - 2 : 0;
  }, [chapters, chapter.id]);

  const [footerBtnProps, setButtonProperties] =
    useState<ButtonsProperties>(defaultButtonLayout);

  const checkViewableItems = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    const curChapter = getString('readerScreen.drawer.scrollToCurrentChapter');
    let newBtnLayout = Object.create(defaultButtonLayout);

    if (viewableItems.length !== 0) {
      let visible = viewableItems.find(({ item }) => {
        return item.id === chapter.id;
      });
      if (!visible && scrollToIndex) {
        if (
          listAscending
            ? (viewableItems[0].index ?? 0) < scrollToIndex + 2
            : (viewableItems[0].index ?? 0) > scrollToIndex + 2
        ) {
          newBtnLayout.down = {
            text: curChapter,
            index: scrollToIndex,
          };
        } else {
          newBtnLayout.up = {
            text: curChapter,
            index: scrollToIndex,
          };
        }
      }

      setButtonProperties(newBtnLayout);
    }
  };
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

  return (
    <View style={styles.drawer}>
      <Text style={styles.headerCtn}>{getString('common.chapters')}</Text>
      {scrollToIndex === undefined ? (
        <LoadingScreenV2 theme={theme} />
      ) : (
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
