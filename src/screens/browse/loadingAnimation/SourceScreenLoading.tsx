import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MD3ThemeType } from '@theme/types';
import LoadingNovel from './LoadingNovel';
import getLoadingColors from '@utils/getLoadingColors';

interface Props {
  theme: MD3ThemeType;
}

const MalLoading: React.FC<Props> = ({ theme }) => {
  const styles = createStyleSheet();

  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const renderLoadingNovel = (item: number, index: number) => {
    let randomNumber = Math.random();
    randomNumber < 0.1 ? (randomNumber = 0) : null;
    return (
      <LoadingNovel
        key={index}
        backgroundColor={backgroundColor}
        highlightColor={highlightColor}
        pictureHeight={174.5}
      />
    );
  };
  const renderLoading = (item: number, index: number) => {
    const offset = Math.pow(10, item);
    const items: Array<number> = [1 * offset, 2 * offset, 3 * offset];
    return (
      <View key={index} style={styles.row}>
        {items.map(renderLoadingNovel)}
      </View>
    );
  };
  const items: Array<number> = [1, 2, 3, 4];
  return <View style={styles.container}>{items.map(renderLoading)}</View>;
};

const createStyleSheet = () => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      marginHorizontal: 4,
      marginBottom: 8,
      marginTop: 2,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 1,
    },
  });
};

export default memo(MalLoading);
