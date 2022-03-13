import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';

import { Container } from '..';
import { ThemeTypeV1 } from '../../theme/v1/theme/types';

const LoadingScreen: React.FC<{ theme: ThemeTypeV1 }> = ({ theme }) => (
  <Container>
    <ActivityIndicator
      size={50}
      color={theme.colorAccent}
      style={styles.indicator}
    />
  </Container>
);

export default LoadingScreen;

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
