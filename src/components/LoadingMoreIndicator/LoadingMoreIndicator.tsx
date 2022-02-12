import React from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';

import {ThemeType} from '../../theme/types';

const LoadingMoreIndicator: React.FC<{theme: ThemeType}> = ({theme}) => (
  <ActivityIndicator color={theme.primary} style={styles.indicator} />
);

export default LoadingMoreIndicator;

const styles = StyleSheet.create({
  indicator: {
    padding: 32,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
