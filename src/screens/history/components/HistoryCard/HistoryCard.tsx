import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import { IconButtonV2 } from '@components';

import { defaultCover } from '@plugins/helpers/constants';
import { getString } from '@strings/translations';
import { useTheme } from '@hooks/persisted';

import { History, NovelInfo } from '@database/types';
import { HistoryScreenProps } from '@navigators/types';

import { coverPlaceholderColor } from '@theme/colors';

interface HistoryCardProps {
  history: History;
  handleRemoveFromHistory: (chapterId: number) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  history,
  handleRemoveFromHistory,
}) => {
  const theme = useTheme();
  const { navigate } = useNavigation<HistoryScreenProps['navigation']>();

  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={() =>
        navigate('Chapter', {
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
            navigate('Novel', {
              name: history.name,
              path: history.novelPath,
              cover: history.novelCover,
              pluginId: history.pluginId,
            })
          }
        >
          <Image
            source={{ uri: history.novelCover || defaultCover }}
            style={styles.cover}
          />
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
