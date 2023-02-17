import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemeColors } from '../../theme/types';

interface Props {
  theme: ThemeColors;
}

const LoadingMoreIndicator: React.FC<Props> = ({ theme }) => (
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
