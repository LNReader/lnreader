import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';
import { NovelItem } from '@plugins/types';

interface GlobalSearchNovelCoverProps {
  novel: NovelItem;
  theme: ThemeColors;
  onPress: () => void;
  inLibrary: boolean;
  onLongPress: () => void;
}

const GlobalSearchNovelCover = ({
  novel,
  theme,
  onPress,
  inLibrary,
  onLongPress,
}: GlobalSearchNovelCoverProps) => {
  const { name, cover } = novel;

  const uri = cover;

  return (
    <View style={styles.container}>
      <Pressable
        android_ripple={{ color: theme.rippleColor }}
        style={styles.pressable}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Image
          source={{ uri }}
          style={[styles.novelCover, inLibrary && { opacity: 0.5 }]}
          progressiveRenderingEnabled={true}
        />
        <Text
          numberOfLines={2}
          style={[styles.title, { color: theme.onSurface }]}
        >
          {name}
        </Text>
      </Pressable>
    </View>
  );
};

export default GlobalSearchNovelCover;

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    flex: 1,
    overflow: 'hidden',
  },
  novelCover: {
    backgroundColor: coverPlaceholderColor,
    borderRadius: 4,
    height: 150,
    width: 115,
  },
  pressable: {
    borderRadius: 4,
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  title: {
    flexWrap: 'wrap',
    fontFamily: 'pt-sans-bold',
    fontSize: 14,
    padding: 4,
    width: 115,
  },
});
