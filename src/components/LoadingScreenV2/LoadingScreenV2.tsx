import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';

import { ThemeColors } from '../../theme/types';

const LoadingScreen: React.FC<{ theme: ThemeColors }> = ({ theme }) => (
  <ActivityIndicator size={50} color={theme.primary} style={styles.indicator} />
);

export default LoadingScreen;

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
