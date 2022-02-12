import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import FastImage from 'react-native-fast-image';
import {easeGradient} from 'react-native-easing-gradient';
import {LinearGradient} from 'expo-linear-gradient';

import {ThemeType} from '../../../../theme/types';

interface NovelScreenBackdropProps {
  coverUri?: string;
  theme: ThemeType;
  children: ReactNode;
}

const NovelScreenBackdrop: React.FC<NovelScreenBackdropProps> = ({
  coverUri,
  children,
  theme,
}) => {
  const {colors, locations} = easeGradient({
    colorStops: {
      0: {color: 'rgba(0,0,0,0)'},
      1: {color: theme.background},
    },
  });

  return (
    <FastImage source={{uri: coverUri}} style={styles.backdropContainer}>
      <View style={{backgroundColor: `${theme.background}B4`}}>
        <LinearGradient
          colors={colors}
          locations={locations}
          style={styles.backdropGradient}
        >
          <View style={styles.childrenContainer}>{children}</View>
        </LinearGradient>
      </View>
    </FastImage>
  );
};

export default NovelScreenBackdrop;

const styles = StyleSheet.create({
  backdropContainer: {
    height: 280,
  },
  backdropGradient: {
    height: 281,
  },
  childrenContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    paddingTop: 120,
  },
});
