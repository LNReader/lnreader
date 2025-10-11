import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  ImageBackground,
  Image,
  ImageURISource,
} from 'react-native';
import color from 'color';
import { IconButton, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Chip } from '../../../../components';
import { coverPlaceholderColor } from '../../../../theme/colors';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toImageUri } from '@utils/coverUri';
interface CoverImageProps {
  children: React.ReactNode;
  source: ImageURISource;
  theme: ThemeColors;
  hideBackdrop: boolean;
}

interface NovelThumbnailProps {
  source: ImageURISource;
  theme: ThemeColors;
  setCustomNovelCover: () => Promise<void>;
  saveNovelCover: () => Promise<void>;
}

interface NovelTitleProps {
  theme: ThemeColors;
  children: React.ReactNode;
  onLongPress: () => void;
  onPress: () => void;
}

const NovelInfoContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.novelInfoContainer}>{children}</View>
);

const CoverImage = ({
  children,
  source,
  theme,
  hideBackdrop,
}: CoverImageProps) => {
  const uri = useMemo(() => toImageUri(source.uri), [source.uri]);

  if (hideBackdrop) {
    return <View>{children}</View>;
  } else {
    return (
      <ImageBackground key={uri} source={{ uri }} style={styles.coverImage}>
        <View
          style={[
            { backgroundColor: color(theme.background).alpha(0.7).string() },
            styles.flex1,
          ]}
        >
          {uri ? (
            <LinearGradient
              colors={['rgba(0,0,0,0)', theme.background]}
              locations={[0, 1]}
              style={styles.linearGradient}
            >
              {children}
            </LinearGradient>
          ) : (
            children
          )}
        </View>
      </ImageBackground>
    );
  }
};

const NovelThumbnail = ({
  source,
  theme,
  setCustomNovelCover,
  saveNovelCover,
}: NovelThumbnailProps) => {
  const [expanded, setExpanded] = useState(false);
  const { top, right } = useSafeAreaInsets();

  const uri = useMemo(() => toImageUri(source.uri), [source.uri]);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={styles.novelThumbnailContainer}
    >
      {!expanded ? (
        <Image source={{ uri }} style={styles.novelThumbnail} />
      ) : (
        <Portal>
          <IconButton
            icon="content-save"
            style={[
              styles.absoluteIcon,
              styles.zIndex,
              { top: top + 6, right: right + 6 },
            ]}
            iconColor={theme.onBackground}
            onPress={saveNovelCover}
          />
          <IconButton
            icon="pencil-outline"
            style={[
              styles.absoluteIcon,
              styles.zIndex,
              { top: top + 6, right: right + 60 },
            ]}
            iconColor={theme.onBackground}
            onPress={setCustomNovelCover}
          />
          <Pressable
            style={[styles.expandedOverlay]}
            onPress={() => setExpanded(false)}
          >
            <Image source={{ uri }} resizeMode="contain" style={styles.flex1} />
          </Pressable>
        </Portal>
      )}
    </Pressable>
  );
};

const NovelTitle = ({
  theme,
  children,
  onLongPress,
  onPress,
}: NovelTitleProps) => (
  <Text
    onLongPress={onLongPress}
    onPress={onPress}
    style={[{ color: theme.onBackground }, styles.novelTitle]}
    numberOfLines={4}
  >
    {children}
  </Text>
);

const NovelInfo = ({
  theme,
  children,
}: {
  theme: ThemeColors;
  children: React.ReactNode;
}) => (
  <Text
    style={[{ color: theme.onSurfaceVariant }, styles.novelInfo]}
    numberOfLines={1}
  >
    {children}
  </Text>
);

const FollowButton = ({
  theme,
  onPress,
  followed,
}: {
  theme: ThemeColors;
  onPress: () => void;
  followed: boolean;
}) => (
  <View style={styles.followButtonContainer}>
    <Pressable
      android_ripple={{
        color: color(theme.primary).alpha(0.12).string(),
        borderless: false,
      }}
      onPress={onPress}
      style={styles.followButtonPressable}
    >
      <IconButton
        icon={followed ? 'heart' : 'heart-outline'}
        iconColor={followed ? theme.primary : theme.outline}
        size={24}
        style={styles.iconButton}
      />
      <Text
        style={[
          { color: followed ? theme.primary : theme.outline },
          styles.followButtonText,
        ]}
      >
        {followed
          ? getString('novelScreen.inLibaray')
          : getString('novelScreen.addToLibaray')}
      </Text>
    </Pressable>
  </View>
);

const TrackerButton = ({
  theme,
  isTracked,
  onPress,
}: {
  theme: ThemeColors;
  onPress: () => void;
  isTracked: boolean;
}) => (
  <View style={styles.followButtonContainer}>
    <Pressable
      android_ripple={{
        color: theme.rippleColor,
        borderless: false,
      }}
      onPress={onPress}
      style={styles.followButtonPressable}
    >
      <IconButton
        icon={isTracked ? 'check' : 'sync'}
        iconColor={isTracked ? theme.primary : theme.outline}
        size={24}
        style={styles.iconButton}
      />
      <Text
        style={[
          { color: isTracked ? theme.primary : theme.outline },
          styles.followButtonText,
        ]}
      >
        {isTracked
          ? getString('novelScreen.tracked')
          : getString('novelScreen.tracking')}
      </Text>
    </Pressable>
  </View>
);

const NovelGenres = ({
  theme,
  genres,
}: {
  theme: ThemeColors;
  genres: string;
}) => {
  const data = genres.split(/,\s*/);

  return (
    <FlatList
      contentContainerStyle={styles.genreContainer}
      horizontal
      data={data}
      keyExtractor={(item, index) => 'genre' + index}
      renderItem={({ item }) => <Chip label={item} theme={theme} />}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export {
  NovelInfoContainer,
  CoverImage,
  NovelThumbnail,
  NovelTitle,
  NovelInfo,
  FollowButton,
  TrackerButton,
  NovelGenres,
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  coverImage: {},
  absoluteIcon: {
    position: 'absolute',
  },
  expandedOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  followButtonContainer: {
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1,
  },
  followButtonPressable: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  followButtonText: {
    fontSize: 12,
  },
  iconButton: {
    margin: 0,
  },
  genreChip: {
    borderRadius: 50,
    flex: 1,
    fontSize: 12,
    justifyContent: 'center',
    marginHorizontal: 2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    textTransform: 'capitalize',
  },
  genreContainer: {
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  linearGradient: {
    flex: 1,
  },
  novelInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  novelInfoContainer: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    marginTop: 28,
    paddingTop: 90,
  },
  novelThumbnail: {
    backgroundColor: coverPlaceholderColor,
    borderRadius: 6,
    height: 150,
    width: 100,
  },
  novelThumbnailContainer: {
    height: 150,
    marginHorizontal: 4,
    width: 100,
  },
  novelTitle: {
    fontSize: 20,
  },
  zIndex: { zIndex: 10 },
});
