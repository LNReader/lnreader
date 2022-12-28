import { ChapterItem } from '@database/types';
import { MD3ThemeType } from '@theme/types';
import color from 'color';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface DrawerChapterItemProps {
  item: ChapterItem;
  theme: MD3ThemeType;
  chapterTitle: string;
  currentChapterId: number;
  changeChapter: (item: ChapterItem) => void;
}

const DrawerChapterItem: React.FC<DrawerChapterItemProps> = ({
  item,
  theme,
  chapterTitle,
  currentChapterId,
  changeChapter,
}) => {
  const styles = createStylesheet(theme);
  return (
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
          {chapterTitle}
        </Text>
        {item.releaseDate && (
          <Text style={styles.releaseDateCtn}>{item.releaseDate}</Text>
        )}
      </Pressable>
    </View>
  );
};
export default DrawerChapterItem;

const createStylesheet = (theme: MD3ThemeType) => {
  return StyleSheet.create({
    chapterNameCtn: {
      fontSize: 12,
      marginBottom: 2,
      color: theme.textColorPrimary,
    },
    chapterCtn: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 10,
      justifyContent: 'center',
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
  });
};
