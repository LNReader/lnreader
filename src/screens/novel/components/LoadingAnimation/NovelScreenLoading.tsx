import React, { memo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@theme/types';
import getLoadingColors from '@utils/getLoadingColors';

interface Props {
  theme: ThemeColors;
}

const NovelScreenLoading: React.FC<Props> = ({ theme }) => {
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  const styles = createStyleSheet();

  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const RenderLoadingNovelTop = () => {
    return (
      <View style={styles.novelTopContainer}>
        <ShimmerPlaceHolder
          style={styles.picture}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={150}
          width={100}
        />
        <View style={styles.novelTopText}>
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={25}
            width={240}
          />
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={20}
            width={240}
          />
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={20}
            width={240}
          />
        </View>
      </View>
    );
  };

  const RenderLoadingNovelInformation = () => {
    return (
      <View style={styles.novelInformationContainer}>
        <View style={styles.icons}>
          <ShimmerPlaceHolder
            style={styles.icon}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={56}
            width={90}
          />
          <ShimmerPlaceHolder
            style={styles.icon}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={56}
            width={90}
          />
          <ShimmerPlaceHolder
            style={styles.icon}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={56}
            width={90}
          />
        </View>
        <View style={styles.novelInformationText}>
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={16}
            width={350}
          />
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={16}
            width={350}
          />
        </View>
        <View style={styles.novelInformationChips}>
          <ShimmerPlaceHolder
            style={styles.chip}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={32}
            width={60}
          />
          <ShimmerPlaceHolder
            style={styles.chip}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={32}
            width={60}
          />
        </View>
      </View>
    );
  };

  const renderLoadingChapter = (item: number, index: number) => {
    return (
      <View style={styles.chapter} key={index}>
        <ShimmerPlaceHolder
          style={styles.text}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={20}
          width={350}
        />
        <ShimmerPlaceHolder
          style={styles.text}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={16}
          width={350}
        />
      </View>
    );
  };

  const RenderLoadingChapters = () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    return (
      <View style={styles.chapterContainer}>
        <ShimmerPlaceHolder
          style={[styles.text, { marginBottom: 5 }]}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={30}
          width={350}
        />
        {items.map(renderLoadingChapter)}
      </View>
    );
  };

  const RenderLoading = () => {
    return (
      <>
        <RenderLoadingNovelTop />
        <RenderLoadingNovelInformation />
        <RenderLoadingChapters />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <RenderLoading />
    </View>
  );
};

const createStyleSheet = () => {
  return StyleSheet.create({
    novelTopContainer: {
      paddingTop: 118,
      height: 268,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
    novelTopText: {
      height: 100,
      paddingTop: 30,
      justifyContent: 'center',
    },
    novelInformationContainer: {
      marginVertical: 4,
    },
    icons: {
      paddingVertical: 4,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    icon: {
      borderRadius: 30,
    },
    novelInformationText: {
      margin: 16,
      marginTop: 8,
      height: 62,
    },
    novelInformationChips: {
      flexDirection: 'row',
      paddingBottom: 6,
      paddingLeft: 8,
    },
    chip: {
      marginLeft: 8,
      borderRadius: 8,
    },
    chapterContainer: {
      marginHorizontal: 16,
    },
    chapter: {
      paddingVertical: 8,
    },
    container: {
      flexGrow: 1,
      marginHorizontal: 4,
      marginBottom: 8,
      overflow: 'hidden',
    },
    loadingContainer: {
      padding: 4.8,
      width: 124.2,
      height: 229.1,
      overflow: 'hidden',
    },
    text: {
      borderRadius: 8,
      marginTop: 5,
    },
    loadingText: {
      margin: 10,
      height: 10,
      width: Dimensions.get('window').width - 140,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    picture: {
      borderRadius: 8,
    },
  });
};

export default memo(NovelScreenLoading);
