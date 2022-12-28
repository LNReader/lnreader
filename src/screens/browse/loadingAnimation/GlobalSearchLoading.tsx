import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MD3ThemeType } from '@theme/types';
import color from 'color';
import LoadingNovel from './LoadingNovel';

interface Props {
  theme: MD3ThemeType;
}

const GlobalSearchLoading: React.FC<Props> = ({ theme }) => {
  const styles = createStyleSheet();

  const highlightColor = color(theme.primary).alpha(0.08).string();
  let backgroundColor = theme.surface;

  backgroundColor = color(backgroundColor).isDark()
    ? color(backgroundColor).luminosity() !== 0
      ? color(backgroundColor).lighten(0.1).toString()
      : color(backgroundColor).negate().darken(0.98).toString()
    : color(backgroundColor).darken(0.04).toString();

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

export default memo(GlobalSearchLoading);
