import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@hooks/persisted';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
  retryIconColor?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: theme.outline }]}>ಥ_ಥ</Text>
      <Text style={[styles.error, { color: theme.outline }]}>{error}</Text>
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
