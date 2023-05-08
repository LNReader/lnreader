import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeColors } from '@theme/types';
import LoadingNovel from './LoadingNovel';
import getLoadingColors from '@utils/getLoadingColors';
import { DisplayModes } from '@screens/library/constants/constants';

interface Props {
  theme: ThemeColors;
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
            pictureWidth={100}
            displayMode={DisplayModes.Comfortable}
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
