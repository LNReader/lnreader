import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@theme/types';
import useLoadingColors from '@utils/useLoadingColors';
import { useAppSettings } from '@hooks/persisted/index';

interface Props {
  width: number;
  height: number;
  theme: ThemeColors;
}

const CategorySkeletonLoading: React.FC<Props> = ({ height, width, theme }) => {
  const { disableLoadingAnimations } = useAppSettings();
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

  const [highlightColor, backgroundColor] = useLoadingColors(theme);

  const renderLoadingCard = (item: number, index: number) => {
    return (
      <View key={index}>
        <ShimmerPlaceHolder
          style={styles.categoryCard}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={height}
          width={width}
          stopAutoRun={disableLoadingAnimations}
        />
      </View>
    );
  };

  const items = [];
  for (let index = 0; index < Math.random() * 6 + 3; index++) {
    items.push(0);
  }

  return <View style={styles.contentCtn}>{items.map(renderLoadingCard)}</View>;
};

const styles = StyleSheet.create({
  categoryCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  contentCtn: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
});

export default memo(CategorySkeletonLoading);
