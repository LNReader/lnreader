import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';

import { ThemeType } from '../../theme/types';

const LoadingScreen: React.FC<{ theme: ThemeType }> = ({ theme }) => (
  <ActivityIndicator
    size={50}
    color={theme.colorAccent}
    style={styles.indicator}
  />
);

export default LoadingScreen;

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
