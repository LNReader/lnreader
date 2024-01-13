import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { ThemeColors } from '@theme/types';

interface Props {
  novel: {
    novelName: string;
    novelCover: string;
    score: string;
    info: string[];
  };
  onPress: () => void;
  theme: ThemeColors;
}

const MalNovelCard: React.FC<Props> = ({ novel, onPress, theme }) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.overlay3 }]}>
      <Pressable
        style={styles.pressable}
        onPress={onPress}
        android_ripple={{ color: theme.rippleColor }}
      >
        <FastImage source={{ uri: novel.novelCover }} style={styles.cover} />
        <View style={styles.infoContainer}>
          <Text
            style={[styles.title, { color: theme.onSurface }]}
            numberOfLines={2}
          >
            {novel.novelName}
          </Text>
          <Text style={[styles.small, { color: theme.onSurface }]}>
            Score:{' '}
            <Text style={{ color: theme.onSurfaceVariant }}>{novel.score}</Text>
          </Text>
          {novel?.info?.[1] ? (
            <Text style={[styles.small, { color: theme.onSurface }]}>
              Type:{' '}
              <Text style={{ color: theme.onSurfaceVariant }}>
                {novel.info[1]}
              </Text>
            </Text>
          ) : null}
          {novel?.info?.[2] ? (
            <Text style={[styles.small, { color: theme.onSurface }]}>
              Published:{' '}
              <Text style={{ color: theme.onSurfaceVariant }}>
                {novel.info[2]}
              </Text>
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
};

export default MalNovelCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    elevation: 1,
    margin: 8,
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
  },
  cover: {
    width: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  infoContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 4,
    fontSize: 16,
  },
  small: {
    marginVertical: 4,
    fontSize: 12,
  },
});
