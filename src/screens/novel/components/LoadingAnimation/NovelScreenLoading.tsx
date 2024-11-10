import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@theme/types';
import getLoadingColors from '@utils/getLoadingColors';
import { useAppSettings, useTheme } from '@hooks/persisted/index';

interface Props {
  theme: ThemeColors;
}

const LoadingShimmer = memo(
  ({
    style,
    height,
    width,
  }: {
    style?: any;
    height: number;
    width: number | string;
  }) => {
    const { disableLoadingAnimations } = useAppSettings();
    const theme = useTheme();
    const [highlightColor, backgroundColor] = getLoadingColors(theme);
    const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

    return (
      <ShimmerPlaceHolder
        style={style}
        shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
        height={height}
        width={width}
        stopAutoRun={disableLoadingAnimations}
      />
    );
  },
);

const NovelTop = memo(() => (
  <View style={styles.headerContainer}>
    <LoadingShimmer style={styles.picture} height={150} width={100} />
    <View style={styles.headerText}>
      <LoadingShimmer style={styles.text} height={25} width={240} />
      <LoadingShimmer style={styles.text} height={20} width={240} />
      <LoadingShimmer style={styles.text} height={20} width={240} />
    </View>
  </View>
));

const NovelInformation = memo(() => (
  <View style={styles.metadataContainer}>
    <View style={styles.statsContainer}>
      {[...Array(3)].map((_, i) => (
        <LoadingShimmer key={i} style={styles.icon} height={56} width={90} />
      ))}
    </View>
    <View style={styles.novelInformationText}>
      {[...Array(2)].map((_, i) => (
        <LoadingShimmer key={i} style={styles.text} height={16} width={350} />
      ))}
    </View>
    <View style={styles.novelInformationChips}>
      {[...Array(2)].map((_, i) => (
        <LoadingShimmer key={i} style={styles.chip} height={32} width={60} />
      ))}
    </View>
  </View>
));

const ChapterItem = memo(({ index }: { index: number }) => (
  <View style={styles.chapter}>
    <LoadingShimmer style={styles.text} height={20} width={350} />
    <LoadingShimmer style={styles.text} height={16} width={350} />
  </View>
));

const Chapters = memo(() => (
  <View style={styles.chapterContainer}>
    <LoadingShimmer
      style={[styles.text, { marginBottom: 5 }]}
      height={30}
      width={350}
    />
    {[...Array(7)].map((_, i) => (
      <ChapterItem key={i} index={i} />
    ))}
  </View>
));

const NovelScreenLoading: React.FC<Props> = ({ theme }) => {
  return (
    <View style={styles.container}>
      <NovelTop />
      <NovelInformation />
      <Chapters />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 118,
    height: 268,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  headerText: {
    height: 100,
    paddingTop: 30,
    justifyContent: 'center',
  },
  metadataContainer: {
    marginVertical: 4,
  },
  statsContainer: {
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
  text: {
    borderRadius: 8,
    marginTop: 5,
  },
  picture: {
    borderRadius: 8,
  },
});

export default memo(NovelScreenLoading);
