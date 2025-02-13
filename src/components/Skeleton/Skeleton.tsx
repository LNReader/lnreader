import { useAppSettings, useTheme } from '@hooks/persisted';
import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
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
  const { disableLoadingAnimations } = useAppSettings();
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

function ChapterSkeleton({
  style,
  disableLoadingAnimations,
}: {
  style?: StyleProp<ViewStyle>;
  disableLoadingAnimations?: boolean;
}) {
  const theme = useTheme();
  const [highlightColor, backgroundColor] = useLoadingColors(theme);

  const LGC = React.useMemo(
    () => createLGC(highlightColor, style, disableLoadingAnimations),
    [disableLoadingAnimations, highlightColor, style],
  );

  return (
    <View style={[styles.chapter, styles.h40]}>
      <View style={[styles.flex, styles.chapterText]}>
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
            styles.h15,
            {
              backgroundColor: backgroundColor,
            },
          ]}
        >
          {LGC}
        </View>
      </View>
      <View
        style={[
          styles.default,
          styles.circle,
          {
            backgroundColor: backgroundColor,
          },
        ]}
      >
        {LGC}
      </View>
    </View>
  );
}

function VerticalBarSkeleton() {
  const [LGC, backgroundColor] = useSetupLoadingAnimations();
  return (
    <View
      style={[
        { backgroundColor: backgroundColor },
        styles.verticalBar,
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

const ChapterListSkeleton = () => {
  const sv = useSharedValue(0);
  const { disableLoadingAnimations } = useAppSettings();

  React.useEffect(() => {
    if (disableLoadingAnimations) return;
    sv.value = withRepeat(withSequence(0, withTiming(160, { duration })), -1);
  }, [disableLoadingAnimations, sv]);

  const style = useAnimatedProps(() => {
    return {
      left: (sv.value + '%') as `${number}%`,
    };
  });

  return (
    <>
      {[...Array(7)].map((_, i) => (
        <ChapterSkeleton
          key={i}
          style={style}
          disableLoadingAnimations={disableLoadingAnimations}
        />
      ))}
    </>
  );
};

export { ChapterListSkeleton, NovelMetaSkeleton, VerticalBarSkeleton };

const styles = StyleSheet.create({
  novelInformationText: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 2.5,
    paddingTop: 5,
    height: 62,
  },
  metaGap: {
    marginTop: 22,
  },
  chapterText: {
    height: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  chapter: {
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  default: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  flex: { flex: 1 },
  row: { flexDirection: 'row' },
  circle: {
    borderRadius: 20,
    alignSelf: 'center',
    marginLeft: 20,
    height: 30,
    width: 30,
  },
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
  chip: {
    width: 80,
    height: 30,
    borderRadius: 8,
    marginRight: 8,
  },
  LG: {
    width: '60%',
    height: 30,
    position: 'absolute',
    transform: [{ translateX: '-100%' }],
  },
  verticalBar: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 4,
  },
});
