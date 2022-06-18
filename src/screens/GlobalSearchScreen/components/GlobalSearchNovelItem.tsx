import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useMemo } from 'react';

import FastImage from 'react-native-fast-image';

import { coverPlaceholderColor } from '../../../theme/colors';

import { SourceNovelItem } from '../../../sources/types';
import { ThemeType } from '../../../theme/types';

interface Props {
  novel: SourceNovelItem;
  navigateToNovel: (novel: SourceNovelItem) => void;
  theme: ThemeType;
}

const GlobalSearchNovelItem: React.FC<Props> = ({
  novel,
  navigateToNovel,
  theme,
}) => {
  const novelItemDimensions = useMemo(
    () => ({
      width: Dimensions.get('window').width / 3 - 16,
      height: ((Dimensions.get('window').width / 3 - 16) * 4) / 3,
    }),
    [],
  );

  return (
    <View style={styles.novelItem}>
      <Pressable
        style={styles.pressable}
        android_ripple={{ color: theme.rippleColor }}
        onPress={() => navigateToNovel(novel)}
      >
        <FastImage
          source={{ uri: novel.novelCover }}
          style={[styles.novelCover, { ...novelItemDimensions }]}
        />
        <Text
          style={[
            { color: theme.textColorPrimary, width: novelItemDimensions.width },
            styles.novelName,
          ]}
          numberOfLines={2}
        >
          {novel.novelName}
        </Text>
      </Pressable>
    </View>
  );
};

export default GlobalSearchNovelItem;

const styles = StyleSheet.create({
  novelItem: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pressable: {
    padding: 4,
    flex: 1,
  },
  novelName: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexWrap: 'wrap',
    fontSize: 12,
    fontWeight: 'bold',
  },
  novelCover: {
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
});
