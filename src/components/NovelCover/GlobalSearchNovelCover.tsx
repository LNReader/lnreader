import React, {useCallback} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useAppearanceSettings, useLibrarySettings} from '../../redux/hooks';

import {LibraryNovelInfo, NovelInfo} from '../../database/types';
import {SourceNovelItem} from '../../sources/types';
import {ThemeType} from '../../theme/types';
import {UnreadBadge, DownloadsBadge, InLibraryBadge} from './NovelCoverBadges';
import {DisplayModes} from '../../redux/settings/settingsSlice';
import {LinearGradient} from 'expo-linear-gradient';
import {useDeviceOrientation} from '../../hooks';
import {DeviceOrientation} from '../../hooks/useDeviceOrientation';
import useNovelCoverHeight from './hooks/useNovelCoverHeight';

interface GlobalSearchNovelCoverProps {
  item: LibraryNovelInfo | SourceNovelItem | NovelInfo;
  theme: ThemeType;
  showInLibraryBadge?: boolean;
  onPress: () => void;
}

const GlobalSearchNovelCover: React.FC<GlobalSearchNovelCoverProps> = ({
  item,
  onPress,
  showInLibraryBadge = false,
  theme,
}) => {
  const {displayMode} = useAppearanceSettings();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.pressable}
        android_ripple={{color: theme.rippleColor}}
        onPress={onPress}
      >
        {showInLibraryBadge ? <InLibraryBadge theme={theme} /> : null}
        <FastImage
          source={{uri: item.novelCover}}
          style={[
            {height: 150, width: 115},
            styles.image,
            showInLibraryBadge && styles.inLibrary,
          ]}
        >
          {displayMode === DisplayModes.Compact ? (
            <CompactTitle name={item.novelName} />
          ) : null}
        </FastImage>
        {displayMode === DisplayModes.Comfortable ? (
          <Text
            numberOfLines={2}
            style={[{color: theme.textColorPrimary}, styles.title]}
          >
            {item.novelName}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};

export default GlobalSearchNovelCover;

const CompactTitle = ({name}: {name: string}) => (
  <View style={styles.compactTitleContainer}>
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.linearGradient}
    >
      <Text numberOfLines={2} style={[styles.title, styles.compactTitle]}>
        {name}
      </Text>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 6,
  },
  pressable: {
    flexShrink: 1,
    padding: 6,
  },
  badgeContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 12,
    left: 12,
    flexDirection: 'row',
  },
  image: {
    borderRadius: 4,
  },
  inLibrary: {
    opacity: 0.5,
  },
  title: {
    padding: 4,
    fontSize: 12,
    flexWrap: 'wrap',
    width: 115,
  },
  compactTitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    borderRadius: 4,
  },
  linearGradient: {
    borderRadius: 4,
    padding: 4,
    paddingTop: 16,
  },
  compactTitle: {
    color: 'rgba(255,255,255,1)',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {
      width: -1,
      height: 1,
    },
    textShadowRadius: 10,
    flexWrap: 'wrap',
    width: 115,
  },
});
