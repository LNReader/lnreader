import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@theme/types';
import useLoadingColors from '@utils/useLoadingColors';
import { useAppSettings } from '@hooks/persisted/index';

interface Props {
  theme: ThemeColors;
}

const HistorySkeletonLoading: React.FC<Props> = ({ theme }) => {
  const { disableLoadingAnimations } = useAppSettings();
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  const [highlightColor, backgroundColor] = useLoadingColors(theme);

  const renderLoadingChapter = (index: number) => (
    <View key={`historyLoading${index}`}>
      {index === 0 || Math.random() > 0.6 ? (
        <ShimmerPlaceHolder
          style={styles.date}
          shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
          height={19.3}
          width={Math.random() * 40 + 50}
          stopAutoRun={disableLoadingAnimations}
        />
      ) : null}
      <View style={styles.chapterCtn}>
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
          {Array.from({ length: 2 }).map((_, buttonIndex) => (
            <ShimmerPlaceHolder
              key={buttonIndex}
              style={styles.button}
              shimmerColors={[backgroundColor, highlightColor, backgroundColor]}
              height={24}
              width={24}
              stopAutoRun={disableLoadingAnimations}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const items = Array.from({ length: Math.floor(Math.random() * 3 + 3) });

  return <View>{items.map((_, index) => renderLoadingChapter(index))}</View>;
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12.5,
  },
  buttonCtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  chapterCtn: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 8,
  },
  contentCtn: {
    paddingVertical: 8,
  },
  date: {
    borderRadius: 6,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  picture: {
    borderRadius: 4,
    height: 80,
    marginHorizontal: 16,
    width: 56,
  },
  text: {
    borderRadius: 6,
    marginBottom: 4,
  },
  textCtn: {
    borderRadius: 6,
    marginBottom: 2,
    marginTop: 5,
  },
});

export default memo(HistorySkeletonLoading);
