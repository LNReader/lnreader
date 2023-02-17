import React from 'react';
import { View } from 'react-native';
import color from 'color';

import { useReaderSettings } from '@redux/hooks';
import SkeletonLines from '../components/SkeletonLines';

const ChapterLoadingScreen = () => {
  const {
    theme: backgroundColor,
    padding,
    textSize,
    lineHeight,
  } = useReaderSettings();

  return (
    <View style={{ backgroundColor }}>
      <SkeletonLines
        containerMargin={padding + '%'}
        containerHeight={'100%'}
        containerWidth={'100%'}
        color={
          color(backgroundColor).isDark()
            ? color(backgroundColor).luminosity() !== 0
              ? color(backgroundColor).lighten(0.1).toString()
              : color(backgroundColor).negate().darken(0.98).toString()
            : color(backgroundColor).darken(0.04).toString()
        }
        highlightColor={
          color(backgroundColor).isDark()
            ? color(backgroundColor).luminosity() !== 0
              ? color(backgroundColor).lighten(0.4).toString()
              : color(backgroundColor).negate().darken(0.92).toString()
            : color(backgroundColor).darken(0.08).toString()
        }
        textSize={textSize}
        lineHeight={lineHeight}
      />
    </View>
  );
};

export default ChapterLoadingScreen;
