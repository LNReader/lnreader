import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MD3ThemeType } from '@theme/types';
import color from 'color';
import LoadingNovel from './LoadingNovel';

interface Props {
  theme: MD3ThemeType;
}

const MalLoading: React.FC<Props> = ({ theme }) => {
  const styles = createStyleSheet();

  const highlightColor = color(theme.primary).alpha(0.08).string();
  let backgroundColor = theme.surface;

  backgroundColor = color(backgroundColor).isDark()
    ? color(backgroundColor).luminosity() !== 0
      ? color(backgroundColor).lighten(0.1).toString()
      : color(backgroundColor).negate().darken(0.98).toString()
    : color(backgroundColor).darken(0.04).toString();

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
