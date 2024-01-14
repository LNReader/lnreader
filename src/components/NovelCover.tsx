import React, { memo, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Pressable,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import FastImage from 'react-native-fast-image';
import ListView from './ListView';

import { useDeviceOrientation } from '@hooks/useDeviceOrientation';
import { coverPlaceholderColor } from '../theme/colors';
import { useLibrarySettings } from '@hooks/useSettings';
import { DisplayModes } from '@screens/library/constants/constants';
import { LibraryNovelInfo } from '@database/types';
import { SourceNovelItem } from 'src/sources/types';
import { ThemeColors } from '@theme/types';
import SourceScreenSkeletonLoading from '@screens/browse/loadingAnimation/SourceScreenSkeletonLoading';

import { defaultUserAgentString } from '@utils/fetch/fetch';

interface NovelCoverProps {
  item: LibraryNovelInfo;
  onPress: () => void;
  libraryStatus?: boolean;
  theme: ThemeColors;
  isSelected?: boolean;
  onLongPress: (novelId: number) => void;
  selectedNovels?: Array<SourceNovelItem>;
}

const NovelCover: React.FC<NovelCoverProps> = ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [numColumns],
  );

  const selectNovel = () => onLongPress && onLongPress(item.novelId);

  const uri = item.novelCover;

  return item.sourceId < 0 ? (
    <SourceScreenSkeletonLoading theme={theme} completeRow={item.sourceId} />
  ) : displayMode !== DisplayModes.List ? (
    <View
      style={[
        {
          flex: 1 / numColumns,
        },
        styles.standardNovelCover,
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
          source={{
            uri,
            headers: { 'User-Agent': defaultUserAgentString },
          }}
          style={[
            {
              height: coverHeight,
              backgroundColor: coverPlaceholderColor,
            },
            styles.standardBorderRadius,
            libraryStatus && styles.opacityPoint5,
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

const ComfortableTitle: React.FC<{ theme: ThemeColors; novelName: string }> = ({
  theme,
  novelName,
}) => (
  <Text
    numberOfLines={2}
    style={[
      styles.title,
      styles.padding4,
      {
        color: theme.onSurface,
      },
    ]}
  >
    {novelName}
  </Text>
);

const CompactTitle: React.FC<{ novelName: string }> = ({ novelName }) => (
  <View style={styles.titleContainer}>
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.linearGradient}
    >
      <Text numberOfLines={2} style={[styles.title, styles.compactTitle]}>
        {novelName}
      </Text>
    </LinearGradient>
  </View>
);

const InLibraryBadge: React.FC<{ theme: ThemeColors }> = ({ theme }) => (
  <Text
    style={[
      styles.inLibraryBadge,
      {
        backgroundColor: theme.primary,
        color: theme.onPrimary,
      },
      styles.standardBorderRadius,
    ]}
  >
    In library
  </Text>
);

interface BadgeProps {
  chaptersDownloaded: number;
  chaptersUnread: number;
  theme: ThemeColors;
}
interface UnreadBadgeProps extends BadgeProps {
  showDownloadBadges: boolean;
}
interface DownloadBadgeProps extends BadgeProps {
  showUnreadBadges: boolean;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({
  chaptersDownloaded,
  chaptersUnread,
  showDownloadBadges,
  theme,
}) => (
  <Text
    style={[
      styles.unreadBadge,
      !chaptersDownloaded && styles.LeftBorderRadius,
      !showDownloadBadges && styles.standardBorderRadius,
      {
        backgroundColor: theme.primary,
        color: theme.onPrimary,
      },
    ]}
  >
    {chaptersUnread}
  </Text>
);

const DownloadBadge: React.FC<DownloadBadgeProps> = ({
  chaptersDownloaded,
  showUnreadBadges,
  chaptersUnread,
  theme,
}) => (
  <Text
    style={[
      styles.downloadBadge,
      !chaptersUnread && styles.RightBorderRadius,
      !showUnreadBadges && styles.standardBorderRadius,
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
  LeftBorderRadius: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  RightBorderRadius: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  standardBorderRadius: {
    borderRadius: 4,
  },
  opacityPoint5: { opacity: 0.5 },
  padding4: { padding: 4 },
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
  standardNovelCover: {
    borderRadius: 6,
    overflow: 'hidden',
    margin: 2,
  },
  compactTitle: {
    color: 'rgba(255,255,255,1)',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
