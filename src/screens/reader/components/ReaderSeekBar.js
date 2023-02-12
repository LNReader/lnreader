import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import color from 'color';

import Slider from '@react-native-community/slider';
import { useDeviceOrientation } from '../../../services/utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VerticalScrollbar = ({
  hide,
  theme,
  minScroll,
  verticalSeekbar,
  currentScroll,
  useWebViewForChapter,
  scrollViewRef,
  webViewRef,
  setCurrentScroll,
}) => {
  const { bottom } = useSafeAreaInsets();
  const onSlidingComplete = value => {
    let offsetY = Math.round(
      ((value - minScroll) * Dimensions.get('window').height) / minScroll,
    );
    if (useWebViewForChapter) {
      webViewRef.current.injectJavaScript(`(()=>{
        window.scrollTo({top: ${offsetY}, left:0, behavior:"smooth"});
      })()`);
    } else {
      scrollViewRef.current.scrollTo({
        x: 0,
        y: offsetY,
        animated: false,
      });
    }
    setCurrentScroll({ offsetY: offsetY, percentage: value });
  };
  const screenOrientation = useDeviceOrientation();

  if (hide) {
    return null;
  }

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
          {currentScroll.percentage || Math.round(minScroll)}
        </Text>
        <Slider
          style={{
            flex: 1,
            height: 40,
          }}
          minimumValue={Math.round(minScroll)}
          maximumValue={100}
          step={1}
          value={currentScroll.percentage || Math.round(minScroll)}
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
          {currentScroll.percentage}
        </Text>
        <Slider
          style={{
            flex: 1,
            height: 40,
          }}
          minimumValue={Math.round(minScroll)}
          maximumValue={100}
          step={1}
          value={currentScroll.percentage || Math.round(minScroll)}
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
