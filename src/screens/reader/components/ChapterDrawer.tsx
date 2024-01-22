import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import color from 'color';
import { useAppSettings, useNovel, useTheme } from '@hooks/persisted';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { Button, LoadingScreenV2 } from '@components/index';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getString } from '@strings/translations';
import { ChapterScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import { ThemeColors } from '@theme/types';
import dayjs from 'dayjs';

const ChapterDrawer = ({ route, navigation }: ChapterScreenProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStylesheet(theme, insets);
  const listRef = useRef<FlashList<ChapterInfo>>(null);
  const { chapter, novel: novelItem } = route.params;
  const { defaultChapterSort } = useAppSettings();
  const { chapters, novelSettings } = useNovel(
    novelItem.url,
    novelItem.pluginId,
  );
  const { sort = defaultChapterSort } = novelSettings;

  const listAscending = sort === 'ORDER BY id ASC';
  const scrollToIndex = useMemo(() => {
    if (chapters.length < 1) {
      return 0;
    }
    const indexOfCurrentChapter =
      chapters.findIndex(el => {
        return el.id === chapter.id;
      }) || 0;
    let res = indexOfCurrentChapter >= 2 ? indexOfCurrentChapter - 2 : 0;
    return res;
  }, [chapters, chapter.id, listAscending]);

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

  const changeChapter = (item: ChapterInfo) => {
    navigation.replace('Chapter', {
      novel: novelItem,
      chapter: item,
    });
  };
  const renderItem: FlashListProps<ChapterInfo>['renderItem'] = ({ item }) => {
    const parsedTime = dayjs(item.releaseTime);
    return (
      <View
        style={[
          styles.drawerElementContainer,
          item.id === chapter.id && {
            backgroundColor: color(theme.primary).alpha(0.12).string(),
          },
        ]}
      >
        <Pressable
          android_ripple={{ color: theme.rippleColor }}
          onPress={() => changeChapter(item)}
          style={styles.chapterCtn}
        >
          <Text numberOfLines={1} style={styles.chapterNameCtn}>
            {item.name}
          </Text>
          <Text style={styles.releaseDateCtn}>
            {parsedTime.isValid() ? parsedTime.format('LL') : item.readTime}
          </Text>
        </Pressable>
      </View>
    );
  };

  const ListFooter = () => {
    return (
      <View style={styles.footer}>
        <Button
          mode="contained"
          style={styles.button}
          title={buttonProperties.up.text}
          onPress={buttonProperties.up.func}
        />
        <Button
          mode="contained"
          style={styles.button}
          title={buttonProperties.down.text}
          onPress={buttonProperties.down.func}
        />
      </View>
    );
  };
  const checkViewableItems: FlashListProps<ChapterInfo>['onViewableItemsChanged'] =
    ({ viewableItems }) => {
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
        if (!visible) {
          if (
            listAscending
              ? viewableItems[0].item.id < chapter.id
              : viewableItems[0].item.id > chapter.id
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

  return (
    <View style={styles.drawer}>
      <Text style={styles.headerCtn}>{getString('common.chapters')}</Text>
      {scrollToIndex !== undefined ? (
        <FlashList
          ref={listRef}
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
