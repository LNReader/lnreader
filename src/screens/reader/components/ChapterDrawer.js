import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Drawer, Text, TouchableRipple } from 'react-native-paper';
import color from 'color';
import { useTheme } from '@hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import { DrawerItem } from '@react-navigation/drawer';

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
  });

  const chapters = state.routes[0].params.chapters;
  const { sourceId, novelUrl, novelName } =
    state.routes[0].params.currentChapter;
  const indexOfCurrentChapter = chapters.findIndex(el => {
    if (el.chapterId === state.routes[0].params.currentChapter.chapterId) {
      return true;
    }
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
    return (
      <TouchableRipple
        rippleColor={theme.secondary}
        style={styles.drawerElementContainer}
        onPress={() => changeChapter(item)}
        borderless={true}
      >
        <Text style={styles.drawerElement}>
          {item.chapterName.replace('Chapter ', '')}
        </Text>
      </TouchableRipple>
    );
  };
  
  return (
    <View style={styles.drawer}>
      <FlashList
        data={chapters}
        renderItem={renderItem}
        estimatedItemSize={56}
        initialScrollIndex={indexOfCurrentChapter}
      />
    </View>
  );
};

export default ChapterDrawer;
