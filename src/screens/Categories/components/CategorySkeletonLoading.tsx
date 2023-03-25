import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@theme/types';
import getLoadingColors from '@utils/getLoadingColors';

interface Props {
  width: number;
  height: number;
  theme: ThemeColors;
}

const CategorySkeletonLoading: React.FC<Props> = ({ height, width, theme }) => {
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const renderLoadingCard = (item: number, index: number) => {
    return (
      <View key={index}>
        <ShimmerPlaceHolder
          style={styles.categoryCard}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={height}
          width={width}
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
