import React, { memo, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import color from 'color';

import { LinearGradient } from 'expo-linear-gradient';
import FastImage from 'react-native-fast-image';
import ListView from './ListView';

import { useDeviceOrientation } from '../services/utils/helpers';
import { coverPlaceholderColor } from '../theme/colors';
import { useLibrarySettings } from '@hooks/useSettings';
import { DisplayModes } from '@screens/library/constants/constants';

const NovelCover = ({
  item,
  onPress,
  libraryStatus,
  theme,
  isSelected,
  onLongPress,
  selectedNovels,
}) => {
  const {
    displayMode = DisplayModes.Comfortable,
    showDownloadBadges = true,
    showUnreadBadges = true,
    novelsPerRow = 3,
  } = useLibrarySettings();

  const window = useWindowDimensions();

  const orientation = useDeviceOrientation();

  const numColumns = useMemo(
    () => (orientation === 'landscape' ? 6 : novelsPerRow),
    [orientation, novelsPerRow],
  );

  const coverHeight = useMemo(
    () => (window.width / numColumns) * (4 / 3),
    [numColumns],
  );

  const selectNovel = () => onLongPress && onLongPress(item.novelId);

  const uri = item.novelCover;

  return displayMode !== DisplayModes.List ? (
    <View
      style={[
        {
          flex: 1 / numColumns,
          borderRadius: 6,
          overflow: 'hidden',
          margin: 2,
        },
        isSelected && {
          backgroundColor: theme.primary,
          opacity: 0.8,
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
        style={styles.opac}
        onPress={
          selectedNovels && selectedNovels.length > 0 ? selectNovel : onPress
        }
        onLongPress={selectNovel}
      >
        <View style={styles.badgeContainer}>
          {libraryStatus && <InLibraryBadge theme={theme} />}
          {showDownloadBadges && item.chaptersDownloaded && (
            <DownloadBadge
              showUnreadBadges={showUnreadBadges}
              chaptersDownloaded={item.chaptersDownloaded}
              chaptersUnread={item.chaptersUnread}
              theme={theme}
            />
          )}
          {showUnreadBadges && item.chaptersUnread && (
            <UnreadBadge
              theme={theme}
              chaptersDownloaded={item.chaptersDownloaded}
              chaptersUnread={item.chaptersUnread}
              showDownloadBadges={showDownloadBadges}
            />
          )}
        </View>
        <FastImage
          source={{ uri }}
          style={[
            {
              height: coverHeight,
              borderRadius: 4,
              backgroundColor: coverPlaceholderColor,
            },
            libraryStatus && { opacity: 0.5 },
          ]}
        />
        <View style={styles.compactTitleContainer}>
          {displayMode === DisplayModes.Compact && (
            <CompactTitle novelName={item.novelName} />
          )}
        </View>
        {displayMode === DisplayModes.Comfortable && (
          <ComfortableTitle novelName={item.novelName} theme={theme} />
        )}
      </Pressable>
    </View>
  ) : (
    <ListView
      item={item}
      downloadBadge={
        showDownloadBadges &&
        item.chaptersDownloaded && (
          <DownloadBadge
            theme={theme}
            showUnreadBadges={showUnreadBadges}
            chaptersDownloaded={item.chaptersDownloaded}
            chaptersUnread={item.chaptersUnread}
          />
        )
      }
      unreadBadge={
        showUnreadBadges &&
        item.chaptersUnread && (
          <UnreadBadge
            theme={theme}
            chaptersDownloaded={item.chaptersDownloaded}
            chaptersUnread={item.chaptersUnread}
            showDownloadBadges={showDownloadBadges}
          />
        )
      }
      inLibraryBadge={libraryStatus && <InLibraryBadge theme={theme} />}
      theme={theme}
      onPress={
        selectedNovels && selectedNovels.length > 0 ? selectNovel : onPress
      }
      onLongPress={selectNovel}
      isSelected={isSelected}
    />
  );
};

export default memo(NovelCover);

const ComfortableTitle = ({ theme, novelName }) => (
  <Text
    numberOfLines={2}
    style={[
      styles.title,
      {
        color: theme.textColorPrimary,
        padding: 4,
      },
    ]}
  >
    {novelName}
  </Text>
);

const CompactTitle = ({ novelName }) => (
  <View style={styles.titleContainer}>
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.linearGradient}
    >
      <Text
        numberOfLines={2}
        style={[
          styles.title,
          {
            color: 'rgba(255,255,255,1)',
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: -1, height: 1 },
            textShadowRadius: 10,
          },
        ]}
      >
        {novelName}
      </Text>
    </LinearGradient>
  </View>
);

const InLibraryBadge = ({ theme }) => (
  <Text
    style={[
      styles.inLibraryBadge,
      {
        backgroundColor: theme.primary,
        color: theme.onPrimary,
        borderRadius: 4,
      },
    ]}
  >
    In library
  </Text>
);

const UnreadBadge = ({
  chaptersDownloaded,
  chaptersUnread,
  showDownloadBadges,
  theme,
}) => (
  <Text
    style={[
      styles.unreadBadge,
      !chaptersDownloaded && {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
      },
      !showDownloadBadges && {
        borderRadius: 4,
      },
      {
        backgroundColor: theme.primary,
        color: theme.onPrimary,
      },
    ]}
  >
    {chaptersUnread}
  </Text>
);

const DownloadBadge = ({
  chaptersDownloaded,
  showUnreadBadges,
  chaptersUnread,
  theme,
}) => (
  <Text
    style={[
      styles.downloadBadge,
      !chaptersUnread && {
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
      },
      !showUnreadBadges && {
        borderRadius: 4,
      },
      {
        backgroundColor: theme.tertiary,
        color: theme.onTertiary,
      },
    ]}
  >
    {chaptersDownloaded}
  </Text>
);

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    borderRadius: 4,
  },
  title: {
    fontFamily: 'pt-sans-bold',
    fontSize: 14,
    padding: 8,
  },
  linearGradient: {
    borderRadius: 4,
  },
  opac: {
    padding: 4.8,
    borderRadius: 4,
    flex: 1,
  },
  extensionIcon: {
    width: 42,
    height: 42,
    borderRadius: 4,
  },
  listView: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
  },

  downloadBadge: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    paddingTop: 2,
    paddingHorizontal: 5,
    fontSize: 12,
  },
  unreadBadge: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingTop: 2,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  inLibraryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  compactTitleContainer: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
  },
  badgeContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 10,
    left: 10,
    flexDirection: 'row',
  },
});
