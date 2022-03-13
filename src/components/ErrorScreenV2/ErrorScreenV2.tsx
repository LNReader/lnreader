import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Container } from '..';

import { ThemeTypeV1 } from '../../theme/v1/theme/types';

interface ErrorScreenProps {
  error?: string;
  theme: ThemeTypeV1;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, theme }) => {
  return (
    <Container>
      <View style={styles.container}>
        <Text style={[styles.icon, { color: theme.textColorHint }]}>ಥ_ಥ</Text>
        <Text style={[styles.error, { color: theme.textColorHint }]}>
          {error}
        </Text>
      </View>
    </Container>
  );
};

export default ErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 44,
  },
  error: {
    marginTop: 16,
  },
});
