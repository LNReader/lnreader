import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '@providers/Providers';

interface SwitchProps {
  value: boolean;
  onValueChange?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const Switch = ({ value, size = 22, onValueChange, style }: SwitchProps) => {
  const theme = useTheme();
  // Value for Switch Animation
  // const switchTranslate = useSharedValue(value ? size : size / 6);

  // Background color animation progress
  const progress = useSharedValue(value ? size : 0);

  // Animate switch movement
  const customSpringStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(value ? size : size / 6, {
          mass: 1,
          damping: 15,
          stiffness: 120,
          overshootClamping: false,
        }),
      },
    ],
  }));

  // Precompute background color animation
  const backgroundColor = useDerivedValue(
    () =>
      interpolateColor(
        progress.value,
        [0, size],
        [theme.outline, theme.primary],
      ),
    [value],
  );

  const backgroundColorStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  useEffect(() => {
    progress.value = withTiming(value ? size : 0);
  }, [progress, size, value]);

  return (
    <Pressable onPress={onValueChange}>
      <Animated.View
        style={[
          styles.container,
          style,
          {
            width: size * 2 + size / 6,
            height: size + size / 3,
            borderRadius: size,
          },
          backgroundColorStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.circle,
            customSpringStyles,
            { height: size, width: size, borderRadius: size },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(Switch);

const styles = StyleSheet.create({
  circle: {
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  container: {
    justifyContent: 'center',
  },
});
