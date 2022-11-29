import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Drawer, Text, TouchableRipple } from 'react-native-paper';
import color from 'color';
import { useTheme } from '@hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import { Button } from '@components/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ChapterDrawer = ({ state, navigation, descriptors }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    drawer: {
      flex: 1,
      backgroundColor: color(theme.surface).alpha(0.9).string(),
      color: color(theme.textColorPrimary).toString(),
    },
    drawerElement: {
      color: theme.textColorPrimary,
      overflow: 'visible',
      paddingLeft: 5,
      width: 240,
      height: '100%',
      textAlignVertical: 'center',
    },
    drawerElementContainer: {
      backgroundColor: color(theme.surface).alpha(0.5).string(),
      height: 50,
      margin: 5,
      marginLeft: 20,
      marginRight: 10,
      borderRadius: 10,
      borderColor: color(theme.secondaryContainer).alpha(0.5).string(),
      borderWidth: 2,
    },
    button: {
      margin: 10,
      marginLeft: 20,
      marginTop: 5,
    },
    transition: {
      width: '100%',
      height: 30,
      zIndex: 2,
      marginBottom: -30,
    },
  });

  let listRef = useRef();
  const chapters = state.routes[0].params.chapters;
  const [buttonProperties, setButtonProperties] = useState({
    up: {
      text: 'Scroll to top',
      func: () => {
        listRef.current.scrollToIndex({ index: 0, animated: true });
      },
    },
    down: {
      text: 'Scroll to bottom',
      func: () => {
        listRef.current.scrollToEnd({
          animated: true,
        });
      },
    },
  });

  const {
    sourceId,
    novelUrl,
    novelName,
    chapterId: currentChapterId,
  } = state.routes[0].params.currentChapter;
  const indexOfCurrentChapter = chapters.findIndex(el => {
    return el.chapterId === state.routes[0].params.currentChapter.chapterId;
  });

  const changeChapter = item => {
    navigation.replace('Chapter', {
      currentChapter: {
        sourceId,
        novelUrl,
        novelName,
        ...item,
      },
      chapters,
    });
  };
  const renderItem = ({ item }) => {
    let current = {};
    if (item.chapterId === currentChapterId) {
      current = {
        backgroundColor: color(theme.secondaryContainer).alpha(0.5).string(),
      };
    }
    return (
      <TouchableRipple
        rippleColor={theme.secondary}
        style={[styles.drawerElementContainer, current]}
        onPress={() => changeChapter(item)}
        borderless={true}
      >
        <Text style={styles.drawerElement}>
          {item.chapterName.replace('Chapter ', '')}
        </Text>
      </TouchableRipple>
    );
  };
  const ListFooter = () => {
    return (
      <>
        <Button
          theme={theme}
          style={styles.button}
          title={buttonProperties.up.text}
          onPress={() => buttonProperties.up.func()}
        />
        <Button
          theme={theme}
          style={styles.button}
          title={buttonProperties.down.text}
          onPress={buttonProperties.down.func}
        />
      </>
    );
  };
  const checkViewableItems = ({ viewableItems }) => {
    let up = {
      text: 'Scroll to top',
      func: () => {
        listRef.current.scrollToIndex({ index: 0, animated: true });
      },
    };
    let down = {
      text: 'Scroll to bottom',
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
      console.log(viewableItems.length);
      if (!visible) {
        if (viewableItems[0].item.chapterId < currentChapterId) {
          down = {
            text: 'Scroll to current chapter',
            func: () => {
              listRef.current.scrollToIndex({
                index: indexOfCurrentChapter,
                animated: true,
              });
            },
          };
        } else {
          up = {
            text: 'Scroll to current chapter',
            func: () => {
              listRef.current.scrollToIndex({
                index: indexOfCurrentChapter,
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
    <SafeAreaView style={styles.drawer}>
      <LinearGradient
        style={styles.transition}
        colors={[theme.surface, 'rgba(0,0,0, 0)']}
      />
      <FlashList
        ref={ref => (listRef.current = ref)}
        onViewableItemsChanged={checkViewableItems}
        data={chapters}
        renderItem={renderItem}
        estimatedItemSize={56}
        initialScrollIndex={indexOfCurrentChapter}
      />
      <ListFooter />
    </SafeAreaView>
  );
};

export default ChapterDrawer;
