import React, { memo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { MD3ThemeType } from '@theme/types';
import color from 'color';

interface Props {
  theme: MD3ThemeType;
}

const MalLoading: React.FC<Props> = ({ theme }) => {
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  const styles = createStyleSheet();

  const highlightColor = color(theme.primary).alpha(0.08).string();
  let backgroundColor = theme.surface;

  backgroundColor = color(backgroundColor).isDark()
    ? color(backgroundColor).luminosity() !== 0
      ? color(backgroundColor).lighten(0.1).toString()
      : color(backgroundColor).negate().darken(0.98).toString()
    : color(backgroundColor).darken(0.04).toString();

  const renderLoadingNovel = (item: number, index: number) => {
    let randomNumber = Math.random();
    randomNumber < 0.1 ? (randomNumber = 0) : null;
    return (
      <View key={index} style={styles.loadingContainer}>
        <ShimmerPlaceHolder
          style={styles.picture}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={174.5}
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
  const renderLoading = (item: number, index: number) => {
    const offset = Math.pow(10, item);
    const items: Array<number> = [1 * offset, 2 * offset, 3 * offset];
    return (
      <View key={index} style={styles.row}>
        {items.map(renderLoadingNovel)}
      </View>
    );
  };
  const items: Array<number> = [1, 2, 3, 4];
  return <View style={styles.container}>{items.map(renderLoading)}</View>;
};

const createStyleSheet = () => {
  return StyleSheet.create({
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
      borderRadius: 4,
    },
  });
};

export default memo(MalLoading);
