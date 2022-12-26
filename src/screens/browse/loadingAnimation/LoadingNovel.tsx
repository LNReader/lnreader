import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  backgroundColor: string;
  highlightColor: string;
  pictureHeight: number;
}

const LoadingNovel: React.FC<Props> = ({
  backgroundColor,
  highlightColor,
  pictureHeight,
}) => {
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  const styles = createStyleSheet(pictureHeight);
  let randomNumber = Math.random();
  randomNumber < 0.1 ? (randomNumber = 0) : null;
  return (
    <View style={styles.loadingContainer}>
      <ShimmerPlaceHolder
        style={styles.picture}
        shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
        height={pictureHeight}
        width={114.5}
      />

      <ShimmerPlaceHolder
        style={styles.text}
        shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
        height={16}
        width={114.4}
      />
      <ShimmerPlaceHolder
        style={styles.text}
        shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
        height={16}
        width={randomNumber * 114.4}
      />
    </View>
  );
};

const createStyleSheet = (pictureHeight: number) => {
  return StyleSheet.create({
    loadingContainer: {
      padding: 4.8,
      marginBottom: 4,
      width: 124.2,
      height: pictureHeight + 54.6,
      overflow: 'hidden',
    },
    text: {
      borderRadius: 8,
      marginTop: 5,
    },
    picture: {
      borderRadius: 4,
    },
  });
};

export default LoadingNovel;
