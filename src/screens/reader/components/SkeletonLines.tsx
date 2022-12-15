import React from 'react';
import LoadingRect from './SkeletonPlaceholder';
import { View, Dimensions } from 'react-native';

const SkeletonLines = (props: {
  width?: string | number;
  height?: string | number;
  style?: Array<any>;
}) => {
  const width = props.width === undefined ? '100%' : props.width;
  const style = {
    lineHeight: 1.5,
    textSize: 16,
    ...props?.style?.[0],
  };
  const height =
    props.height === undefined ? Dimensions.get('window').height : props.height;

  const createLines = () => {
    let availableHeight: number = isNaN(Number(height))
      ? Number(String(height).replace('%', ''))
      : Number(height);
    let res: boolean[] = [];
    let numberOfLongLines = 0;
    while (availableHeight > style.lineHeight * style.textSize) {
      if (Math.random() * 4 > 1 && numberOfLongLines <= 5) {
        res = [...res, true];
        availableHeight -= style.lineHeight * style.textSize;
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
    if (lines?.[index + 1] !== undefined && !lines[index + 1]) {
      console.log(index, 'ran');

      return (
        <LoadingRect
          key={index}
          style={{ ...style, marginBottom: 0, marginLeft: 0, marginRight: 0 }}
          width={
            String(width)
              ? Math.random() * Number(String(width).replace('%', '')) + '%'
              : Math.random() * Number(width)
          }
          height={style.lineHeight * style.textSize}
        />
      );
    }

    if (item) {
      console.log(index, 'long');

      return (
        <LoadingRect
          key={index}
          style={{ ...style, marginBottom: 0, marginLeft: 0, marginRight: 0 }}
          width={width}
          height={style.lineHeight * style.textSize}
        />
      );
    } else {
      console.log(index, 'wh');
      return <View style={{ height: 16 }} />;
    }
  };

  return (
    <View
      style={{
        position: 'relative',
        width: width,
        height: height,
        ...style,
        backgroundColor: 'transparent',
      }}
    >
      {lines.map(renderLoadingRect)}
    </View>
  );
};

export default SkeletonLines;
