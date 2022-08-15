import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import color from 'color';
import { IconButton, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import FastImage from 'react-native-fast-image';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Chip } from '../../../../components';
import { coverPlaceholderColor } from '../../../../theme/colors';

const NovelInfoContainer = ({ children }) => (
  <View style={styles.novelInfoContainer}>{children}</View>
);

const CoverImage = ({ children, source, theme, hideBackdrop }) => {
  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: 'rgba(0,0,0,0)' },
      1: { color: theme.background },
    },
  });

  if (hideBackdrop) {
    return <View>{children}</View>;
  } else {
    return (
      <FastImage source={source} style={styles.coverImage}>
        <View
          style={{
            flex: 1,
            backgroundColor: `${theme.background}B4`,
          }}
        >
          {source.uri ? (
            <LinearGradient
              colors={colors}
              locations={locations}
              style={styles.linearGradient}
            >
              {children}
            </LinearGradient>
          ) : (
            children
          )}
        </View>
      </FastImage>
    );
  }
};

const NovelThumbnail = ({ source, setCustomNovelCover }) => {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <TouchableWithoutFeedback onPress={() => setExpanded(!expanded)}>
        <FastImage source={source} style={styles.novelThumbnail} />
      </TouchableWithoutFeedback>
    );
  } else {
    return (
      <Portal>
        <IconButton
          icon="close"
          style={{
            position: 'absolute',
            top: StatusBar.currentHeight,
            left: 0,
            zIndex: 10,
          }}
          onPress={() => setExpanded(false)}
        />
        <IconButton
          icon="pencil-outline"
          style={{
            position: 'absolute',
            top: StatusBar.currentHeight,
            right: 0,
            zIndex: 10,
          }}
          onPress={setCustomNovelCover}
        />
        <Pressable
          style={{
            position: 'absolute',
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height + 60,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
          onPress={() => setExpanded(false)}
        >
          <FastImage
            source={source}
            style={{
              width: Dimensions.get('window').width,
              height: (Dimensions.get('window').width * 3) / 2,
            }}
          />
        </Pressable>
      </Portal>
    );
  }
};

const NovelTitle = ({ theme, children, onLongPress, onPress }) => (
  <Text
    onLongPress={onLongPress}
    onPress={onPress}
    style={[styles.novelTitle, { color: theme.onBackground }]}
  >
    {children}
  </Text>
);

const NovelAuthor = ({ theme, children }) => (
  <Text style={[styles.novelAuthor, { color: theme.onSurfaceVariant }]}>
    {children}
  </Text>
);

const NovelInfo = ({ theme, children }) => (
  <Text
    style={[styles.novelInfo, { color: theme.onSurfaceVariant }]}
    numberOfLines={1}
  >
    {children}
  </Text>
);

const FollowButton = ({ theme, onPress, followed }) => (
  <View style={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <Pressable
      android_ripple={{
        color: color(theme.primary).alpha(0.12).string(),
        borderless: false,
      }}
      onPress={onPress}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 8,
      }}
    >
      <IconButton
        icon={followed ? 'heart' : 'heart-outline'}
        iconColor={followed ? theme.primary : theme.textColorHint}
        size={24}
        style={{ margin: 0 }}
      />
      <Text
        style={{
          fontSize: 12,
          color: followed ? theme.primary : theme.textColorHint,
        }}
      >
        {followed ? 'In Library' : 'Add to library'}
      </Text>
    </Pressable>
  </View>
);

const TrackerButton = ({ theme, isTracked, onPress }) => (
  <View style={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <Pressable
      android_ripple={{
        color: theme.rippleColor,
        borderless: false,
      }}
      onPress={onPress}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 8,
      }}
    >
      <IconButton
        icon={isTracked ? 'check' : 'sync'}
        iconColor={isTracked ? theme.primary : theme.textColorHint}
        size={24}
        style={{ margin: 0 }}
      />
      <Text
        style={{
          fontSize: 12,
          color: isTracked ? theme.primary : theme.textColorHint,
        }}
      >
        {isTracked ? 'Tracked' : 'Tracking'}
      </Text>
    </Pressable>
  </View>
);

const NovelGenres = ({ theme, genre }) => {
  const data = genre.split(',');

  const renderItem = ({ item }) => <Chip label={item} theme={theme} />;

  return (
    <FlatList
      contentContainerStyle={styles.genreContainer}
      horizontal
      data={data}
      keyExtractor={item => item}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export {
  NovelInfoContainer,
  CoverImage,
  NovelThumbnail,
  NovelTitle,
  NovelAuthor,
  NovelInfo,
  FollowButton,
  TrackerButton,
  NovelGenres,
};

const styles = StyleSheet.create({
  novelInfoContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 28,
    marginBottom: 0,
    paddingTop: 90,
  },
  coverImage: {},
  linearGradient: {
    flex: 1,
  },
  novelThumbnail: {
    height: 150,
    width: 100,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: coverPlaceholderColor,
  },
  novelTitle: {
    fontSize: 18,
  },
  novelAuthor: {
    marginVertical: 6,
    fontSize: 14,
  },
  novelInfo: {
    fontSize: 14,
  },
  followButton: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    paddingLeft: 4,
    borderWidth: 0,
    elevation: 0,
  },
  genreContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  genreChip: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    fontSize: 12,
    borderRadius: 50,
    textTransform: 'capitalize',
  },
});
