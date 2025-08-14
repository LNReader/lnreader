import React, { memo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@theme/types';
import useLoadingColors from '@utils/useLoadingColors';
import { useAppSettings, useTheme } from '@hooks/persisted/index';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';

interface Props {
  theme: ThemeColors;
}

const FULL_WIDTH = WINDOW_WIDTH - 32;

export const LoadingShimmer = memo(
  ({
    style,
    height,
    width,
    visible = true,
  }: {
    style?: StyleProp<ViewStyle>;
    height: number;
    width: number | string;
    visible?: boolean;
  }) => {
    const { disableLoadingAnimations } = useAppSettings();
    const theme = useTheme();
    const [highlightColor, backgroundColor] = useLoadingColors(theme);
    if (!visible) {
      return null;
    }
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
      <LoadingShimmer
        style={styles.text}
        height={25}
        width={FULL_WIDTH - 116}
      />
      <LoadingShimmer
        style={styles.text}
        height={20}
        width={FULL_WIDTH - 116}
      />
      <LoadingShimmer
        style={styles.text}
        height={20}
        width={FULL_WIDTH - 116}
      />
    </View>
  </View>
));

export const LoadingDescription = memo(() => (
  <View style={styles.novelInformationText}>
    {[...Array(2)].map((_, i) => (
      <LoadingShimmer
        key={i}
        style={styles.text}
        height={16}
        width={FULL_WIDTH}
      />
    ))}
  </View>
));

export const LoadingChips = memo(() => (
  <View style={styles.novelInformationChips}>
    {[...Array(4)].map((_, i) => (
      <LoadingShimmer
        key={i}
        style={styles.chip}
        height={32}
        width={40 + Math.random() * 60}
      />
    ))}
  </View>
));

const NovelInformation = memo(() => (
  <View style={styles.metadataContainer}>
    <View style={styles.statsContainer}>
      {[...Array(3)].map((_, i) => (
        <LoadingShimmer key={i} style={styles.icon} height={56} width={90} />
      ))}
    </View>
    <LoadingDescription />
    <LoadingChips />
  </View>
));

export const LoadingChapterItem = memo(() => (
  <View style={styles.chapter}>
    <View>
      <LoadingShimmer style={styles.text} height={20} width={FULL_WIDTH - 50} />
      <LoadingShimmer style={styles.text} height={16} width={FULL_WIDTH - 50} />
    </View>
    <LoadingShimmer style={styles.loadingChapterItem} height={30} width={30} />
  </View>
));

const Chapters = memo(() => (
  <View>
    <LoadingShimmer
      style={[styles.text, styles.chapters]}
      height={30}
      width={FULL_WIDTH}
    />
    {[...Array(7)].map((_, i) => (
      <LoadingChapterItem key={i} />
    ))}
  </View>
));

const NovelScreenLoading: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <NovelTop />
      <NovelInformation />
      <Chapters />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingChapterItem: { borderRadius: 20, alignSelf: 'center', marginLeft: 20 },
  chapters: { marginBottom: 5, marginHorizontal: 16 },
  chapter: {
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  chapterContainer: {
    marginHorizontal: 16,
  },
  chip: {
    borderRadius: 8,
    marginLeft: 8,
  },
  container: {
    flexGrow: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    height: 268,
    justifyContent: 'space-evenly',
    paddingTop: 118,
    width: '100%',
  },
  headerText: {
    height: 100,
    justifyContent: 'center',
    paddingTop: 30,
  },
  icon: {
    borderRadius: 30,
  },
  metadataContainer: {
    marginVertical: 4,
  },
  novelInformationChips: {
    flexDirection: 'row',
    paddingBottom: 6,
    paddingLeft: 8,
  },
  novelInformationText: {
    backgroundColor: 'red',
    height: 62,
    margin: 16,
    marginTop: 8,
  },
  picture: {
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  text: {
    borderRadius: 8,
    marginTop: 5,
  },
});

export default memo(NovelScreenLoading);
