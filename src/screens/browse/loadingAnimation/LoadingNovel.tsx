import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { DisplayModes } from '@screens/library/constants/constants';
import { useSettingsContext } from '@components/Context/SettingsContext';

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
  const { disableLoadingAnimations } = useSettingsContext();
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  let randomNumber = Math.random();
  if (randomNumber < 0.1) {
    randomNumber = 0.1;
  }
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
          stopAutoRun={disableLoadingAnimations}
        />
        {displayMode === 2 || displayMode === 0 ? null : (
          <>
            <ShimmerPlaceHolder
              style={styles.text}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={16}
              width={pictureWidth}
              stopAutoRun={disableLoadingAnimations}
            />
            <ShimmerPlaceHolder
              style={styles.text}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={16}
              width={randomNumber * pictureWidth}
              stopAutoRun={disableLoadingAnimations}
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
          stopAutoRun={disableLoadingAnimations}
        />

        <ShimmerPlaceHolder
          style={styles.listText}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={18}
          width={textWidth}
          stopAutoRun={disableLoadingAnimations}
        />
        <ShimmerPlaceHolder
          style={styles.picture}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={20}
          width={chapterNumberWidth}
          stopAutoRun={disableLoadingAnimations}
        />
      </View>
    );
  }
};

const createStyleSheet = (pictureHeight: number, pictureWidth: number) => {
  return StyleSheet.create({
    listChapter: {
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    listLoadingContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      marginHorizontal: 8,
      marginVertical: 8,
    },
    listText: {
      borderRadius: 4,
      marginLeft: 16,
      marginRight: 8,
    },
    loadingContainer: {
      height: pictureHeight,
      marginBottom: 4,
      overflow: 'hidden',
      padding: 4.8,
      width: pictureWidth + 9.6,
    },
    picture: {
      borderRadius: 4,
    },
    text: {
      borderRadius: 8,
      marginTop: 5,
    },
  });
};

export default LoadingNovel;
