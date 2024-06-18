import React from 'react';
import { View, Pressable, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import color from 'color';
import { ChapterInfo, NovelInfo } from '@database/types';
import { ThemeColors } from '@theme/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigators/types';
import { StyleProp } from 'react-native';
import { ViewStyle } from 'react-native';

type Styles = {
  chapterCtn: StyleProp<ViewStyle>;
  drawerElementContainer: StyleProp<ViewStyle>;
  chapterNameCtn: StyleProp<TextStyle>;
  releaseDateCtn: StyleProp<TextStyle>;
};
type Navigation = StackNavigationProp<RootStackParamList, 'Chapter', undefined>;

type Props = {
  item: ChapterInfo;
  novelItem: NovelInfo;
  styles: Styles;
  theme: ThemeColors;
  navigation: Navigation;
  chapterId: number;
};
const changeChapter = (
  item: ChapterInfo,
  navigation: Navigation,
  novelItem: NovelInfo,
) => {
  navigation.replace('Chapter', {
    novel: novelItem,
    chapter: item,
  });
};
const renderListChapter = ({
  item,
  novelItem,
  styles,
  theme,
  navigation,
  chapterId,
}: Props) => {
  return (
    <View
      style={[
        styles.drawerElementContainer,
        item.id === chapterId && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: theme.rippleColor }}
        onPress={() => changeChapter(item, navigation, novelItem)}
        style={styles.chapterCtn}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.chapterNameCtn,
            { color: item.unread ? theme.onSurface : theme.outline },
          ]}
        >
          {item.name}
        </Text>
        {item.releaseTime ? (
          <Text
            style={[
              styles.releaseDateCtn,
              { color: item.unread ? theme.onSurfaceVariant : theme.outline },
            ]}
          >
            {item.releaseTime}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};
export default renderListChapter;
