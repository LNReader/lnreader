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

const HistorySkeletonLoading: React.FC<Props> = ({ theme }) => {
  const { disableLoadingAnimations } = useAppSettings();
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const renderLoadingChapter = (item: number, index: number) => {
    return (
      <View key={'historyLoading' + item}>
        {index === 0 || Math.random() > 0.6 ? (
          <ShimmerPlaceHolder
            style={styles.date}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={19.3}
            width={Math.random() * 40 + 50}
            stopAutoRun={disableLoadingAnimations}
          />
        ) : null}
        <View style={styles.chapterCtn} key={index}>
          <ShimmerPlaceHolder
            style={styles.picture}
            shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
            height={80}
            width={56}
            stopAutoRun={disableLoadingAnimations}
          />
          <View style={styles.textCtn}>
            <ShimmerPlaceHolder
              style={styles.text}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={16}
              width={208.7}
              stopAutoRun={disableLoadingAnimations}
            />
            <ShimmerPlaceHolder
              style={styles.text}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={12}
              width={208.7}
              stopAutoRun={disableLoadingAnimations}
            />
          </View>
          <View style={styles.buttonCtn}>
            <ShimmerPlaceHolder
              style={styles.button}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={24}
              width={24}
              stopAutoRun={disableLoadingAnimations}
            />
          </View>
          <View style={styles.buttonCtn}>
            <ShimmerPlaceHolder
              style={styles.button}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={24}
              width={24}
              stopAutoRun={disableLoadingAnimations}
            />
          </View>
        </View>
      </View>
    );
  };

  const items = [];
  for (let index = 0; index < Math.random() * 3 + 3; index++) {
    items.push(index);
  }

  return <View>{items.map(renderLoadingChapter)}</View>;
};

const styles = StyleSheet.create({
  contentCtn: {
    paddingVertical: 8,
  },
  textCtn: {
    marginTop: 5,
    marginBottom: 2,
    borderRadius: 6,
  },
  text: {
    marginBottom: 4,
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
    height: 80,
    width: 56,
  },
  button: {
    borderRadius: 12.5,
  },
  buttonCtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  date: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 6,
  },
});

export default memo(HistorySkeletonLoading);
