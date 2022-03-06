import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useAppearanceSettings, useLibrarySettings } from '../../redux/hooks';

import { LibraryNovelInfo, NovelInfo } from '../../database/types';
import { SourceNovelItem } from '../../sources/types';
import { ThemeType } from '../../theme/types';
import {
  UnreadBadge,
  DownloadsBadge,
  InLibraryBadge,
} from './NovelCoverBadges';
import { DisplayModes } from '../../redux/settings/settingsSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeviceOrientation, useNovelCoverHeight } from '../../hooks';
import { DeviceOrientation } from '../../hooks/useDeviceOrientation';

interface Props extends PressableProps {
  item: LibraryNovelInfo | SourceNovelItem | NovelInfo;
  isSelected: boolean;
  theme: ThemeType;
  showInLibraryBadge?: boolean;
}

const NovelItem: React.FC<Props> = props => {
  const { item, showInLibraryBadge = false, theme, isSelected = false } = props;

  const { displayMode } = useAppearanceSettings();
  const { novelsPerRowLandscape, novelsPerRowPotrait } =
    useAppearanceSettings();
  const { showUnreadBadge, showDownloadsBadge } = useLibrarySettings();

  const orientation = useDeviceOrientation();

  const coverHeight = useNovelCoverHeight();

  const coverSelectedStyle = {
    backgroundColor: theme.primary,
    opacity: 0.8,
  };

  return (
    <View
      style={[
        {
          flex:
            1 /
            (orientation === DeviceOrientation.POTRAIT
              ? novelsPerRowPotrait
              : novelsPerRowLandscape),
        },
        styles.container,
        isSelected && coverSelectedStyle,
      ]}
    >
      <Pressable
        style={styles.pressable}
        android_ripple={{ color: theme.rippleColor }}
        {...props}
      >
        <View style={styles.badgeContainer}>
          {'chaptersDownloaded' in item &&
          item.chaptersDownloaded &&
          showDownloadsBadge ? (
            <DownloadsBadge
              unreadCount={item.chaptersUnread}
              downloadCount={item.chaptersDownloaded}
              showUnreadBadge={showUnreadBadge}
              theme={theme}
            />
          ) : null}
          {'chaptersUnread' in item &&
          item.chaptersUnread &&
          showUnreadBadge ? (
            <UnreadBadge
              unreadCount={item.chaptersUnread}
              downloadCount={item.chaptersDownloaded}
              showDownloadsBadge={showDownloadsBadge}
              theme={theme}
            />
          ) : null}
        </View>
        {showInLibraryBadge ? <InLibraryBadge theme={theme} /> : null}
        <FastImage
          source={{ uri: item.novelCover }}
          style={[
            { height: coverHeight },
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
            style={[{ color: theme.textColorPrimary }, styles.title]}
          >
            {item.novelName}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};

export default NovelItem;

const CompactTitle = ({ name }: { name: string }) => (
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
    overflow: 'hidden',
    borderRadius: 6,
    margin: 2,
  },
  pressable: {
    flex: 1,
    padding: 4,
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
  },
});
