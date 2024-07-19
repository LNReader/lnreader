import React from 'react';
import { View, Pressable, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import color from 'color';
import { ChapterInfo } from '@database/types';
import { ThemeColors } from '@theme/types';
import { StyleProp } from 'react-native';
import { ViewStyle } from 'react-native';

type Styles = {
  chapterCtn: StyleProp<ViewStyle>;
  drawerElementContainer: StyleProp<ViewStyle>;
  chapterNameCtn: StyleProp<TextStyle>;
  releaseDateCtn: StyleProp<TextStyle>;
};

type Props = {
  item: ChapterInfo;
  styles: Styles;
  theme: ThemeColors;
  chapterId: number;
  onPress: () => void;
};

const renderListChapter = ({
  item,
  styles,
  theme,
  onPress,
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
        onPress={onPress}
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
