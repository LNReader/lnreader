import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import dayjs from 'dayjs';
import { Image } from 'react-native';

import { IconButtonV2 } from '@components';

import { History, NovelInfo } from '@database/types';
import { ThemeColors } from '@theme/types';
import { coverPlaceholderColor } from '@theme/colors';
import { getString } from '@strings/translations';
import { HistoryScreenProps } from '@navigators/types';

interface HistoryCardProps {
  history: History;
  handleRemoveFromHistory: (chapterId: number) => void;
  navigation: HistoryScreenProps['navigation'];
  theme: ThemeColors;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  history,
  navigation,
  handleRemoveFromHistory,
  theme,
}) => {
  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={() =>
        navigation.navigate('Chapter', {
          novel: {
            path: history.novelPath,
            name: history.novelName,
            pluginId: history.pluginId,
          } as NovelInfo,
          chapter: history,
        })
      }
    >
      <View style={styles.imageAndNameContainer}>
        <Pressable
          onPress={() =>
            navigation.navigate('Novel', {
              name: history.name,
              path: history.novelPath,
              pluginId: history.pluginId,
            })
          }
        >
          <Image source={{ uri: history.novelCover }} style={styles.cover} />
        </Pressable>
        <View style={styles.detailsContainer}>
          <Text
            numberOfLines={2}
            style={[{ color: theme.onSurface }, styles.novelName]}
          >
            {history.novelName}
          </Text>
          <Text style={{ color: theme.onSurfaceVariant }}>
            {`${getString('historyScreen.chapter')} ${
              history.chapterNumber
            } • ${dayjs(history.readTime).format('LT').toUpperCase()}` +
              `${
                history.progress && history.progress > 0
                  ? ' • ' + history.progress + '%'
                  : ''
              }`}
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <IconButtonV2
          name="delete-outline"
          theme={theme}
          onPress={() => handleRemoveFromHistory(history.id)}
        />
      </View>
    </Pressable>
  );
};

export default HistoryCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cover: {
    height: 80,
    width: 56,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  novelName: {
    marginBottom: 4,
  },
  chapterName: {},
  imageAndNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
