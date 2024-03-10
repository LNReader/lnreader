import {
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { ThemeColors } from '@theme/types';

interface SwitchProps {
  theme: ThemeColors;
  value: boolean;
  onValueChange: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const Switch = ({
  theme,
  value,
  size = 22,
  onValueChange,
  style,
}: SwitchProps) => {
  // value for Switch Animation
  const switchTranslate = useSharedValue(value ? size : size / 6);
  // state for activate Switch
  // Progress Value
  const progress = useDerivedValue(() => {
    return withTiming(value ? size : 0);
  });

  // useEffect for change the switchTranslate Value
  useEffect(() => {
    if (value) {
      switchTranslate.value = size;
    } else {
      switchTranslate.value = size / 6;
    }
  }, [value, switchTranslate, size]);

  // Circle Animation
  const customSpringStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(switchTranslate.value, {
            mass: 1,
            damping: 15,
            stiffness: 120,
            overshootClamping: false,
            restSpeedThreshold: 0.001,
            restDisplacementThreshold: 0.001,
          }),
        },
      ],
    };
  });

  // Background Color Animation
  const backgroundColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, size],
      [theme.outline, theme.primary],
    );
    return {
      backgroundColor,
    };
  });

  return (
    <TouchableWithoutFeedback onPress={onValueChange}>
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
    </TouchableWithoutFeedback>
  );
};

export default Switch;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#F2F5F7',
  },
  circle: {
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});
