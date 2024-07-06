import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { DisplayModes } from '@screens/library/constants/constants';

interface Props {
  backgroundColor: string;
  highlightColor: string;
  pictureHeight: number;
  pictureWidth: number;
  displayMode: DisplayModes;
}

const LoadingNovel: React.FC<Props> = ({
  backgroundColor,
  highlightColor,
  pictureHeight,
  pictureWidth,
  displayMode,
}) => {
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  let randomNumber = Math.random();
  randomNumber < 0.1 ? (randomNumber = 0) : null;
  // pictureWidth = pictureWidth === undefined ? 114.5 : pictureWidth;
  const styles = createStyleSheet(
    pictureHeight + (displayMode === 2 || displayMode === 0 ? 9.6 : 54.6),
    pictureWidth,
  );
  if (displayMode !== 3) {
    return (
      <View style={styles.loadingContainer}>
        <ShimmerPlaceHolder
          style={styles.picture}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={pictureHeight}
          width={pictureWidth}
        />
        {displayMode === 2 || displayMode === 0 ? null : (
          <>
            <ShimmerPlaceHolder
              style={styles.text}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={16}
              width={pictureWidth}
            />
            <ShimmerPlaceHolder
              style={styles.text}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={16}
              width={randomNumber * pictureWidth}
            />
          </>
        )}
      </View>
    );
  } else {
    const chapterNumberWidth = 10 * Math.floor(Math.random() * 7);
    const textWidth = 304.7 - chapterNumberWidth;
    return (
      <View style={styles.listLoadingContainer}>
        <ShimmerPlaceHolder
          style={styles.picture}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={40}
          width={40}
        />

        <ShimmerPlaceHolder
          style={styles.listText}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={18}
          width={textWidth}
        />
        <ShimmerPlaceHolder
          style={styles.picture}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={20}
          width={chapterNumberWidth}
        />
      </View>
    );
  }
};

const createStyleSheet = (pictureHeight: number, pictureWidth: number) => {
  return StyleSheet.create({
    loadingContainer: {
      padding: 4.8,
      marginBottom: 4,
      width: pictureWidth + 9.6,
      height: pictureHeight,
      overflow: 'hidden',
    },
    text: {
      borderRadius: 8,
      marginTop: 5,
    },
    picture: {
      borderRadius: 4,
    },
    listLoadingContainer: {
      marginHorizontal: 8,
      marginVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    listText: {
      marginLeft: 16,
      marginRight: 8,
      borderRadius: 4,
    },
    listChapter: {
      borderRadius: 4,
      paddingHorizontal: 4,
    },
  });
};

export default LoadingNovel;
