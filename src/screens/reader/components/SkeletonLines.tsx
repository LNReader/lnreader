import React, { memo } from 'react';
import { View, Dimensions } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { clockRunning } from 'react-native-reanimated';

const SkeletonLines = ({
  width,
  lineHeight,
  textSize,
  containerWidth,
  containerHeight,
  containerMargin,
  color,
  highlightColor,
}: {
  width?: string | number;
  lineHeight: number;
  textSize: number;
  containerWidth: string | number;
  containerHeight: string | number;
  containerMargin?: string | number;
  color?: string;
  highlightColor?: string;
}) => {
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

  const createLines = () => {
    let availableHeight: number = percentToNumberV(containerHeight) - 10;
    let res: boolean[] = [];
    let numberOfLongLines = 0;
    const height = textSize * lineHeight;

    while (availableHeight > height) {
      if (Math.random() * 4 > 1 && numberOfLongLines <= 5) {
        res = [...res, true];
        availableHeight -= height;
        numberOfLongLines++;
      } else {
        res = [...res, false];
        availableHeight -= 16;
        numberOfLongLines = 0;
      }
    }
    return res;
  };
  const lines = createLines();

  const renderLoadingRect = (item: boolean, index: number) => {
    const skeletonWidth = width ? width : percentToNumberH('90%');
    const skeletonHeight = textSize;
    if (typeof color !== 'string') {
      color = '#ebebeb';
    }
    if (typeof highlightColor !== 'string') {
      highlightColor = '#c5c5c5';
    }
    if (lines?.[index + 1] !== undefined && !lines[index + 1]) {
      return (
        <ShimmerPlaceHolder
          key={index}
          style={{
            marginBottom: textSize * (lineHeight - 1),
            marginLeft: 0,
            marginRight: 0,
            borderRadius: 8,
          }}
          width={
            typeof width === 'string'
              ? percentToNumberH(skeletonWidth) * Math.random() + '%'
              : Math.random() * skeletonWidth
          }
          height={skeletonHeight}
        />
      );
    }

    if (item) {
      return (
        <ShimmerPlaceHolder
          key={index}
          style={{
            marginBottom: textSize * (lineHeight - 1),
            marginLeft: 0,
            marginRight: 0,
            borderRadius: 8,
            backgroundColor: color,
          }}
          shimmerColors={[color, highlightColor, color]}
          width={skeletonWidth}
          height={skeletonHeight}
        />
      );
    } else {
      return <View key={index} style={{ height: 16 }} />;
    }
  };

  return (
    <View
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
        backgroundColor: 'transparent',
        margin: containerMargin,
      }}
    >
      {lines.map(renderLoadingRect)}
    </View>
  );
};

const percentToNumberV = (number: number | string): number => {
  if (isNaN(Number(number))) {
    return (
      Dimensions.get('window').height *
      (Number(String(number).replace('%', '')) / 100)
    );
  } else {
    return Number(number);
  }
};

const percentToNumberH = (number: number | string): number => {
  if (isNaN(Number(number))) {
    return (
      Dimensions.get('window').width *
      (Number(String(number).replace('%', '')) / 100)
    );
  } else {
    return Number(number);
  }
};

export default memo(SkeletonLines);
