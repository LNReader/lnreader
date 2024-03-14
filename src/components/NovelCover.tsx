import React, { memo, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Pressable,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import ListView from './ListView';

import { useDeviceOrientation } from '@hooks';
import { coverPlaceholderColor } from '../theme/colors';
import { DisplayModes } from '@screens/library/constants/constants';
import { LibraryNovelInfo, NovelInfo } from '@database/types';
import { NovelItem } from '@plugins/types';
import { ThemeColors } from '@theme/types';
import { useLibrarySettings } from '@hooks/persisted';
import { getUserAgent } from '@hooks/persisted/useUserAgent';
import { getString } from '@strings/translations';

interface UnreadBadgeProps {
  chaptersDownloaded: number;
  chaptersUnread: number;
  showDownloadBadges: boolean;
  theme: ThemeColors;
}

interface DownloadBadgeProps {
  chaptersDownloaded: number;
  chaptersUnread: number;
  showUnreadBadges: boolean;
  theme: ThemeColors;
}

function NovelCover<TNovel extends NovelItem | NovelInfo | LibraryNovelInfo>({
  item,
  onPress,
  libraryStatus,
  theme,
  isSelected,
  onLongPress,
  selectedNovelIds,
}: {
  item: TNovel;
  onPress: () => void;
  libraryStatus: boolean;
  theme: ThemeColors;
  isSelected: boolean;
  onLongPress: (item: TNovel) => void;
  selectedNovelIds: number[];
}) {
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

  const selectNovel = () => onLongPress(item);

  const uri = item.cover;
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
        android_ripple={{ color: theme.rippleColor }}
        style={styles.opac}
        onPress={
          selectedNovelIds && selectedNovelIds.length > 0
            ? selectNovel
            : onPress
        }
        onLongPress={selectNovel}
      >
        <View style={styles.badgeContainer}>
          {libraryStatus && <InLibraryBadge theme={theme} />}
          {showDownloadBadges && item.chaptersDownloaded > 0 ? (
            <DownloadBadge
              showUnreadBadges={showUnreadBadges}
              chaptersDownloaded={item.chaptersDownloaded}
              chaptersUnread={item.chaptersUnread}
              theme={theme}
            />
          ) : null}
          {showUnreadBadges && item.chaptersUnread > 0 ? (
            <UnreadBadge
              theme={theme}
              chaptersDownloaded={item.chaptersDownloaded}
              chaptersUnread={item.chaptersUnread}
              showDownloadBadges={showDownloadBadges}
            />
          ) : null}
        </View>
        <Image
          source={{ uri, headers: { 'User-Agent': getUserAgent() } }}
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
          {displayMode === DisplayModes.Compact ? (
            <CompactTitle novelName={item.name} />
          ) : null}
        </View>
        {displayMode === DisplayModes.Comfortable ? (
          <ComfortableTitle novelName={item.name} theme={theme} />
        ) : null}
      </Pressable>
    </View>
  ) : (
    <ListView
      item={item}
      downloadBadge={
        showDownloadBadges && item.chaptersDownloaded ? (
          <DownloadBadge
            theme={theme}
            showUnreadBadges={showUnreadBadges}
            chaptersDownloaded={item.chaptersDownloaded}
            chaptersUnread={item.chaptersUnread}
          />
        ) : null
      }
      unreadBadge={
        showUnreadBadges && item.chaptersUnread ? (
          <UnreadBadge
            theme={theme}
            chaptersDownloaded={item.chaptersDownloaded}
            chaptersUnread={item.chaptersUnread}
            showDownloadBadges={showDownloadBadges}
          />
        ) : null
      }
      inLibraryBadge={libraryStatus && <InLibraryBadge theme={theme} />}
      theme={theme}
      onPress={
        selectedNovelIds && selectedNovelIds.length > 0 ? selectNovel : onPress
      }
      onLongPress={selectNovel}
      isSelected={isSelected}
    />
  );
}

export default memo(NovelCover);

const ComfortableTitle = ({
  theme,
  novelName,
}: {
  theme: ThemeColors;
  novelName: string;
}) => (
  <Text
    numberOfLines={2}
    style={[
      styles.title,
      {
        color: theme.onSurface,
        padding: 4,
      },
    ]}
  >
    {novelName}
  </Text>
);

const CompactTitle = ({ novelName }: { novelName: string }) => (
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

const InLibraryBadge = ({ theme }: { theme: ThemeColors }) => (
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
    {getString('novelScreen.inLibaray')}
  </Text>
);

const UnreadBadge = ({
  chaptersDownloaded,
  chaptersUnread,
  showDownloadBadges,
  theme,
}: UnreadBadgeProps) => (
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
}: DownloadBadgeProps) => (
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
