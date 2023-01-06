import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MD3ThemeType } from '@theme/types';
import LoadingNovel from './LoadingNovel';
import getLoadingColors from '@utils/getLoadingColors';

interface Props {
  theme: MD3ThemeType;
}

const GlobalSearchSkeletonLoading: React.FC<Props> = ({ theme }) => {
  const styles = createStyleSheet();

  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const items: Array<number> = [1, 2, 3, 4];
  return (
    <View style={[styles.container, styles.row]}>
      {items.map((item: number, index: number) => {
        return (
          <LoadingNovel
            key={index}
            backgroundColor={backgroundColor}
            highlightColor={highlightColor}
            pictureHeight={153.1}
          />
        );
      })}
    </View>
  );
};

const createStyleSheet = () => {
  return StyleSheet.create({
    container: {
      marginHorizontal: 4,
      marginBottom: 6,
      marginTop: 6,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      paddingHorizontal: 3,
    },
  });
};

export default memo(GlobalSearchSkeletonLoading);
