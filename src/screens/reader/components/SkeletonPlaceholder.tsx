import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  Easing,
  View,
} from 'react-native';

const LoadingRect = (props: {
  width: string | number;
  height: string | number;
  style?: StyleProp<ViewStyle>;
}) => {
  const styles = createStyle();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sharedAnimationConfig = {
      duration: 800,
      useNativeDriver: true,
    };
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          ...sharedAnimationConfig,
          toValue: 1,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          ...sharedAnimationConfig,
          toValue: 0,
          easing: Easing.in(Easing.ease),
        }),
      ]),
    ).start();

    return () => {
      pulseAnim.stopAnimation();
    };
  }, []);

  const opacityAnim = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.18],
  });

  return (
    <Animated.View
      style={[
        styles.loadingView,
        { width: props.width, height: props.height },
        { opacity: opacityAnim },
        props.style,
      ]}
    />
  );
};

const createStyle = () => {
  return StyleSheet.create({
    loadingView: {
      borderRadius: 6,
    },
  });
};

export default LoadingRect;
