import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import color from 'color';

import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeviceOrientation } from '@hooks/useDeviceOrientation';

const VerticalScrollbar = ({
  theme,
  minScroll,
  verticalSeekbar,
  percentage,
  scrollTo,
}) => {
  const { bottom } = useSafeAreaInsets();
  const onSlidingComplete = value => {
    let offsetY =
      ((value - Math.round(minScroll)) * Dimensions.get('window').height) /
      Math.round(minScroll);
    scrollTo(offsetY);
  };
  const screenOrientation = useDeviceOrientation();

  if (screenOrientation === 'potrait' && verticalSeekbar) {
    return (
      <View
        style={[
          styles.verticalSliderContainer,
          { backgroundColor: color(theme.surface).alpha(0.9).string() },
        ]}
      >
        <Text
          style={{
            color: theme.onSurface,
            marginLeft: 16,
            transform: [{ rotate: '-90deg' }],
          }}
        >
          {percentage || Math.round(minScroll)}
        </Text>
        <Slider
          style={{
            flex: 1,
            height: 40,
          }}
          minimumValue={Math.round(minScroll)}
          maximumValue={100}
          step={1}
          value={percentage || Math.round(minScroll)}
          onSlidingComplete={onSlidingComplete}
          thumbTintColor={theme.primary}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.onSurface}
        />
        <Text
          style={{
            color: theme.onSurface,
            marginRight: 16,
            transform: [{ rotate: '-90deg' }],
          }}
        >
          100
        </Text>
      </View>
    );
  } else {
    return (
      <View
        style={[
          styles.horizontalSliderContainer,
          {
            backgroundColor: color(theme.surface).alpha(0.9).string(),
            bottom: 80 + bottom,
          },
        ]}
      >
        <Text
          style={{
            color: '#FFFFFF',
            marginLeft: 16,
          }}
        >
          {percentage || Math.round(minScroll)}
        </Text>
        <Slider
          style={{
            flex: 1,
            height: 40,
          }}
          minimumValue={Math.round(minScroll)}
          maximumValue={100}
          step={1}
          value={percentage || Math.round(minScroll)}
          onSlidingComplete={onSlidingComplete}
          thumbTintColor={theme.primary}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.onSurface}
        />
        <Text
          style={{
            color: '#FFFFFF',
            marginRight: 16,
          }}
        >
          100
        </Text>
      </View>
    );
  }
};

export default VerticalScrollbar;

const styles = StyleSheet.create({
  verticalSliderContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 50,
    marginHorizontal: 8,
    transform: [{ rotate: '90deg' }],
    position: 'absolute',
    zIndex: 2,
    right: -(Dimensions.get('window').width / 2) + 40,
    bottom: 300,
  },
  horizontalSliderContainer: {
    position: 'absolute',
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 50,
    marginHorizontal: 8,
  },
});
