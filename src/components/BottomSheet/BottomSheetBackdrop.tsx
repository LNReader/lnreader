import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CustomBackdrop = ({ style }: BottomSheetBackdropProps) => {
  const { close } = useBottomSheet();
  return (
    <AnimatedPressable
      onPress={() => close()}
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(100)}
      style={[styles.container, style]}
    />
  );
};
export default memo(CustomBackdrop);
