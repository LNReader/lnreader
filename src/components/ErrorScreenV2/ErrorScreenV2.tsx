import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MD3ThemeType } from '@theme/types';

interface ErrorScreenProps {
  error?: string;
  theme: MD3ThemeType;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, theme }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: theme.textColorHint }]}>ಥ_ಥ</Text>
      <Text style={[styles.error, { color: theme.textColorHint }]}>
        {error}
      </Text>
    </View>
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
    paddingHorizontal: 16,
    textAlign: 'center',
  },
});
