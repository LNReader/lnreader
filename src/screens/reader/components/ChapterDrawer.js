import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Drawer, Text } from 'react-native-paper';
import color from 'color';
import { useTheme } from '@hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import { DrawerItem } from '@react-navigation/drawer';

const ChapterDrawer = props => {
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
      paddingLeft: 0,
      width: 240,
      height: '100%',
    },
    drawerElementContainer: {
      backgroundColor: color(theme.surface).alpha(0.5).string(),
      height: 50,
      margin: 5,
    },
  });

  const chapters = props.state.routes[0].params.chapters;
  const { sourceId, novelUrl, novelName } =
    props.state.routes[0].params.currentChapter;
  const changeChapter = item => {
    props.navigation.replace('Chapter', {
      currentChapter: {
        sourceId,
        novelUrl,
        novelName,
        ...item,
      },
      chapters,
    });
  };
  const renderItem = ({ item, index }) => {
    return (
      <DrawerItem
        label={item.chapterName.replace('Chapter ', '')}
        labelStyle={styles.drawerElement}
        style={styles.drawerElementContainer}
        onPress={() => changeChapter(item)}
      />
    );
  };
  return (
    // <DrawerContentScrollView contentContainerStyle={styles.drawer}>
    <View style={styles.drawer}>
      <FlashList
        data={chapters}
        renderItem={renderItem}
        estimatedItemSize={56}
        initialScrollIndex={chapters.findIndex(el => {
          if (
            el.chapterId ===
            props.state.routes[0].params.currentChapter.chapterId
          ) {
            return true;
          }
        })}
      />
    </View>
    // </DrawerContentScrollView>
  );
};

export default ChapterDrawer;
