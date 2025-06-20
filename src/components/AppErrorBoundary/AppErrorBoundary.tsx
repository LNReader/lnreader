import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { SystemBars } from 'react-native-edge-to-edge';

import { Button, List } from '@components';
import { useTheme } from '@hooks/persisted';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.mainCtn, { backgroundColor: theme.background }]}
    >
      <SystemBars style="light" />
      <View style={styles.errorInfoCtn}>
        <Text style={[styles.errorTitle, { color: theme.onSurface }]}>
          An Unexpected Error Ocurred
        </Text>
        <Text style={[styles.errorDesc, { color: theme.onSurface }]}>
          The application ran into an unexpected error. We suggest you
          screenshot this message and then share it in our support channel on
          Discord.
        </Text>
        <Text
          style={[
            styles.errorCtn,
            {
              backgroundColor: theme.surfaceVariant,
              color: theme.onSurfaceVariant,
            },
          ]}
          numberOfLines={20}
        >
          {`${error.message}\n\n${error.stack}`}
        </Text>
      </View>
      <List.Divider theme={theme} />
      <Button
        onPress={resetError}
        title={'Restart the application'}
        style={styles.buttonCtn}
        mode="contained"
      />
    </SafeAreaView>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactElement;
}

const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
};

export default AppErrorBoundary;

const styles = StyleSheet.create({
  buttonCtn: {
    margin: 16,
    marginBottom: 32,
  },
  errorCtn: {
    borderRadius: 8,
    lineHeight: 20,
    marginVertical: 16,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  errorDesc: {
    lineHeight: 20,
    marginVertical: 8,
  },
  errorInfoCtn: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  mainCtn: {
    flex: 1,
  },
});
