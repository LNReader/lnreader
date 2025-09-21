import { useSettingsContext } from '../Context/SettingsContext';
import { useTheme } from '@providers/Providers';
import * as React from 'react';
import { StyleProp, ViewStyle, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import useLoadingColors from './useLoadingColors';
import { LinearGradient } from 'expo-linear-gradient';

const duration = 1000;

function useSetupLoadingAnimations() {
  const sv = useSharedValue(0);
  const { disableLoadingAnimations } = useSettingsContext();
  const theme = useTheme();
  const [highlightColor, backgroundColor] = useLoadingColors(theme);

  const style = useAnimatedProps(() => {
    return {
      left: (sv.value + '%') as `${number}%`,
    };
  });

  const LGC = React.useMemo(
    () => createLGC(highlightColor, style, disableLoadingAnimations),
    [disableLoadingAnimations, highlightColor, style],
  );

  React.useEffect(() => {
    if (disableLoadingAnimations) return;
    sv.value = withRepeat(withSequence(0, withTiming(160, { duration })), -1);
  }, [disableLoadingAnimations, sv]);
  return [LGC, backgroundColor] as const;
}

function createLGC(
  highlightColor: string,
  style: StyleProp<ViewStyle>,
  disableLoadingAnimations?: boolean,
) {
  if (disableLoadingAnimations) return <></>;
  const LG = Animated.createAnimatedComponent(LinearGradient);

  return (
    <React.Suspense fallback={<></>}>
      <LG
        start={[0, 0]}
        end={[1, 0]}
        locations={[0, 0.3, 0.7, 1]}
        style={[style, styles.LG]}
        colors={['transparent', highlightColor, highlightColor, 'transparent']}
      />
    </React.Suspense>
  );
}

const ChapterSkeleton = React.memo(function ChapterSkeleton({
  lgc,
  backgroundStyle,
  img,
}: {
  lgc: React.JSX.Element;
  backgroundStyle: StyleProp<ViewStyle>;
  img?: boolean;
}) {
  return (
    <View style={[styles.chapter, styles.h40]}>
      {img ? (
        <View style={[styles.default, styles.img, backgroundStyle]}>{lgc}</View>
      ) : (
        <></>
      )}
      <View style={[styles.flex, styles.chapterText]}>
        <View style={[styles.default, styles.h20, backgroundStyle]}>{lgc}</View>
        <View style={[styles.default, styles.h15, backgroundStyle]}>{lgc}</View>
      </View>
      <View style={[styles.default, styles.circle, backgroundStyle]}>
        {lgc}
      </View>
    </View>
  );
});

function VerticalBarSkeleton() {
  const [LGC, backgroundColor] = useSetupLoadingAnimations();
  return (
    <View
      style={[
        { backgroundColor: backgroundColor },
        styles.verticalBar,
        styles.default,
        styles.h24,
      ]}
    >
      {LGC}
    </View>
  );
}

function NovelMetaSkeleton() {
  const [LGC, backgroundColor] = useSetupLoadingAnimations();

  const Chips = React.useMemo(
    () => (
      <View
        style={[
          styles.default,
          styles.chip,
          {
            backgroundColor: backgroundColor,
          },
        ]}
      >
        {LGC}
      </View>
    ),
    [LGC, backgroundColor],
  );

  return (
    <View style={[styles.novelInformationText, styles.h62]}>
      <View style={[styles.flex, styles.h20]}>
        <View
          style={[
            styles.default,
            styles.h20,
            {
              backgroundColor: backgroundColor,
            },
          ]}
        >
          {LGC}
        </View>
        <View
          style={[
            styles.default,
            styles.h20,
            {
              backgroundColor: backgroundColor,
            },
          ]}
        >
          {LGC}
        </View>
        <View style={[styles.metaGap, styles.row, styles.flex]}>
          {Chips}
          {Chips}
          {Chips}
          {Chips}
        </View>
      </View>
    </View>
  );
}

const ChapterListSkeleton = ({ img }: { img?: boolean }) => {
  const sv = useSharedValue(0);
  const { disableLoadingAnimations } = useSettingsContext();

  React.useEffect(() => {
    if (disableLoadingAnimations) return;
    sv.value = withRepeat(withSequence(0, withTiming(160, { duration })), -1);
  }, [disableLoadingAnimations, sv]);

  const skeletonItems = React.useMemo(() => Array.from({ length: 7 }), []);

  const animatedProps = useAnimatedProps(() => {
    return {
      left: (sv.value + '%') as `${number}%`,
    };
  });
  const theme = useTheme();
  const [highlightColor, backgroundColor] = useLoadingColors(theme);

  const LGC = React.useMemo(
    () => createLGC(highlightColor, animatedProps, disableLoadingAnimations),
    [animatedProps, disableLoadingAnimations, highlightColor],
  );
  const backgroundStyle = React.useMemo(
    () => ({ backgroundColor }),
    [backgroundColor],
  );

  return (
    <>
      {skeletonItems.map((_, i) => (
        <ChapterSkeleton
          key={i}
          lgc={LGC}
          backgroundStyle={backgroundStyle}
          img={img}
        />
      ))}
    </>
  );
};

export { ChapterListSkeleton, NovelMetaSkeleton, VerticalBarSkeleton };

const styles = StyleSheet.create({
  LG: {
    height: 40,
    position: 'absolute',
    transform: [{ translateX: '-100%' }],
    width: '60%',
  },
  chapter: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  chapterText: {
    height: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  chip: {
    borderRadius: 8,
    height: 30,
    marginRight: 8,
    width: 80,
  },
  circle: {
    alignSelf: 'center',
    borderRadius: 20,
    height: 30,
    marginLeft: 20,
    width: 30,
  },
  default: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  flex: { flex: 1 },
  h15: {
    height: 15,
  },
  h20: {
    height: 20,
    marginBottom: 5,
  },
  h24: {
    height: 24,
  },
  h40: {
    height: 40,
  },
  h62: {
    height: 110,
  },
  img: {
    alignSelf: 'center',
    height: 40,
    marginRight: 20,
    width: 40,
  },
  metaGap: {
    marginTop: 22,
  },
  novelInformationText: {
    height: 62,
    marginBottom: 2.5,
    marginHorizontal: 16,
    marginTop: 8,
    paddingTop: 5,
  },
  row: { flexDirection: 'row' },
  verticalBar: {
    borderRadius: 4,
    marginHorizontal: 16,
    marginVertical: 16,
  },
});
