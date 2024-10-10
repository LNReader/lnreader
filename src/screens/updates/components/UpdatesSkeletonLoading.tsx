import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@theme/types';
import getLoadingColors from '@utils/getLoadingColors';
import { useAppSettings } from '@hooks/persisted/index';

interface Props {
  theme: ThemeColors;
}

const UpdatesSkeletonLoading: React.FC<Props> = ({ theme }) => {
  const { disableLoadingAnimations } = useAppSettings();
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const renderLoadingChapter = (item: number, index: number) => {
    return (
      <View style={styles.chapterCtn} key={index}>
        <ShimmerPlaceHolder
          style={styles.picture}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={42}
          width={42}
          stopAutoRun={disableLoadingAnimations}
        />
        <View>
          <ShimmerPlaceHolder
            style={styles.textTop}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={16}
            width={257.5}
            stopAutoRun={disableLoadingAnimations}
          />
          <ShimmerPlaceHolder
            style={styles.textBottom}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={12}
            width={257.5}
            stopAutoRun={disableLoadingAnimations}
          />
        </View>
        <View style={styles.buttonCtn}>
          <ShimmerPlaceHolder
            style={styles.button}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={25}
            width={25}
            stopAutoRun={disableLoadingAnimations}
          />
        </View>
      </View>
    );
  };

  const items = [];
  for (let index = 0; index < Math.random() * 8 + 4; index++) {
    items.push(0);
  }

  return (
    <View style={styles.contentCtn}>{items.map(renderLoadingChapter)}</View>
  );
};

const styles = StyleSheet.create({
  contentCtn: {
    paddingVertical: 8,
  },
  textTop: {
    marginTop: 5,
    marginBottom: 2,
    borderRadius: 6,
  },
  textBottom: {
    marginTop: 2,
    marginBottom: 5,
    borderRadius: 6,
  },
  chapterCtn: {
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  picture: {
    marginHorizontal: 16,
    borderRadius: 4,
    width: 42,
    height: 42,
  },
  button: {
    borderRadius: 12.5,
  },
  buttonCtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45.1,
    width: 45.1,
  },
});

export default memo(UpdatesSkeletonLoading);
