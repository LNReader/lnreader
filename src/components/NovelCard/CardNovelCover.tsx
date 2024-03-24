import { Pressable, StyleSheet, Image } from 'react-native';
import React from 'react';
import { coverPlaceholderColor } from '@theme/colors';
export const CardNovelCover = ({
  uri,
  navigateToNovel,
}: {
  uri: string;
  navigateToNovel: () => void;
}) => {
  return (
    <Pressable onPress={navigateToNovel} style={styles.container}>
      <Image source={{ uri }} style={styles.cover} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cover: {
    height: '100%',
    width: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  container: {
    position: 'relative',
    height: '100%',
    width: 40,
  },
});
