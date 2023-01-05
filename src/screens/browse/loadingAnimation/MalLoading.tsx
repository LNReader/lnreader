import React, { memo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { MD3ThemeType } from '@theme/types';
import { getDialogBackground } from '@theme/colors';
import getLoadingColors from '@utils/getLoadingColors';

interface Props {
  theme: MD3ThemeType;
}

const MalLoading: React.FC<Props> = ({ theme }) => {
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  const styles = createStyleSheet(theme);

  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const renderLoadingRect = (item: number, index: number) => {
    let randomNumber = Math.random();
    randomNumber < 0.1 ? (randomNumber = 0.1) : null;
    return (
      <View key={index} style={styles.loadingContainer}>
        <ShimmerPlaceHolder
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={120 + Math.random() * 28}
          width={100}
        />
        <View style={styles.loadingText}>
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={16}
            width={Dimensions.get('window').width - 140}
          />
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={16}
            width={Dimensions.get('window').width - 140}
          />
          <ShimmerPlaceHolder
            style={styles.text}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={16}
            width={randomNumber * (Dimensions.get('window').width - 140)}
          />
        </View>
      </View>
    );
  };
  const items: Array<number> = [0, 1, 2, 3, 4];
  return <View style={styles.container}>{items.map(renderLoadingRect)}</View>;
};

const createStyleSheet = (theme: MD3ThemeType) => {
  return StyleSheet.create({
    container: {
      position: 'relative',
      flexGrow: 1,
      //   height: 150,
      backgroundColor: 'transparent',
      marginBottom: 8,
      marginTop: -3,
      overflow: 'hidden',
    },
    loadingContainer: {
      margin: 10,
      borderRadius: 8,
      backgroundColor: getDialogBackground(theme),
      width: Dimensions.get('window').width - 20,
      overflow: 'hidden',
      flexDirection: 'row',
      elevation: 1,
    },
    text: {
      borderRadius: 8,
      marginVertical: 5,
    },
    loadingText: {
      margin: 10,
      height: 10,
      width: Dimensions.get('window').width - 140,
    },
  });
};

export default memo(MalLoading);
