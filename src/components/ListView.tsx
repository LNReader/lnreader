import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

import { Image } from 'react-native';
import { coverPlaceholderColor } from '../theme/colors';

import color from 'color';
import { ThemeColors } from '@theme/types';
import { NovelInfo } from '@database/types';

interface ListViewProps {
  item: NovelInfo;
  downloadBadge?: React.ReactNode;
  unreadBadge?: React.ReactNode;
  inLibraryBadge?: React.ReactNode;
  theme: ThemeColors;
  onPress: () => void;
  isSelected?: boolean;
  onLongPress?: () => void;
}

const ListView = ({
  item,
  downloadBadge,
  unreadBadge,
  inLibraryBadge,
  theme,
  onPress,
  isSelected,
  onLongPress,
}: ListViewProps) => {
  return (
    <Pressable
      android_ripple={{ color: theme.rippleColor }}
      style={[
        styles.listView,
        isSelected && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Image
        source={{
          uri: item.cover,
        }}
        style={[styles.extensionIcon, inLibraryBadge ? { opacity: 0.5 } : {}]}
      />
      <Text
        style={[{ color: theme.onSurface }, styles.novelName]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <View style={styles.badgeContainer}>
        {downloadBadge}
        {unreadBadge}
        {inLibraryBadge}
      </View>
    </Pressable>
  );
};

export default ListView;

const styles = StyleSheet.create({
  listView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  extensionIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  novelName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    paddingRight: 8,
    flexWrap: 'wrap',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
