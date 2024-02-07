import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useMemo } from 'react';
import { Image } from 'react-native';

import { coverPlaceholderColor } from '@theme/colors';

import { NovelItem } from '@plugins/types';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';

interface Props {
  novel: NovelItem;
  pluginId: string;
  navigateToNovel: (item: {
    name: string;
    path: string;
    pluginId: string;
  }) => void;
  theme: ThemeColors;
  onLongPress?: () => void;
  inLibrary?: boolean;
}

const GlobalSearchNovelItem: React.FC<Props> = ({
  novel,
  pluginId,
  navigateToNovel,
  theme,
  onLongPress,
  inLibrary,
}) => {
  const novelItemDimensions = useMemo(
    () => ({
      width: Dimensions.get('window').width / 3 - 16,
      height: ((Dimensions.get('window').width / 3 - 16) * 4) / 3,
      opacity: inLibrary ? 0.5 : 1,
    }),
    [inLibrary],
  );

  return (
    <View style={styles.novelItem}>
      <Pressable
        style={styles.pressable}
        android_ripple={{ color: theme.rippleColor }}
        onPress={() => navigateToNovel({ ...novel, pluginId: pluginId })}
        onLongPress={onLongPress}
      >
        <Image
          source={{ uri: novel.cover }}
          style={[styles.novelCover, { ...novelItemDimensions }]}
        />
        {inLibrary ? (
          <Text
            style={[
              styles.inLibraryBadge,
              {
                backgroundColor: theme.primary,
                color: theme.onPrimary,
              },
            ]}
          >
            {getString('novelScreen.inLibaray')}
          </Text>
        ) : null}
        <Text
          style={[
            { color: theme.onSurface, width: novelItemDimensions.width },
            styles.novelName,
          ]}
          numberOfLines={2}
        >
          {novel.name}
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
  inLibraryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
});
