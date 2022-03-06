import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { defaultCoverUri } from '../../../sources/helpers/constants';

const GlobalSearchNovelCover = ({
  novel,
  theme,
  onPress,
  inLibrary,
  onLongPress,
}) => {
  const { novelName, novelCover } = novel;

  const uri =
    novelCover && !novelCover.startsWith('/') ? novelCover : defaultCoverUri;

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
          style={[styles.title, { color: theme.textColorPrimary }]}
        >
          {novelName}
        </Text>
      </Pressable>
    </View>
  );
};

export default GlobalSearchNovelCover;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pressable: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 4,
    flex: 1,
  },
  novelCover: {
    height: 150,
    width: 115,
    borderRadius: 4,
  },
  title: {
    fontFamily: 'pt-sans-bold',
    fontSize: 14,
    padding: 4,
    flexWrap: 'wrap',
    width: 115,
  },
});
