import React from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';

import { Button, List } from '@components';
import { useTheme } from '@hooks';
import { ButtonVariation } from '@components/Button/Button';

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
    <View style={[styles.mainCtn, { backgroundColor: theme.background }]}>
      <StatusBar translucent={true} backgroundColor="transparent" />
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
        variation={ButtonVariation.DEFAULT}
        onPress={resetError}
        title={'Restart the application'}
        style={styles.buttonCtn}
        theme={theme}
      />
    </View>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactNode | React.ReactElement;
}

const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
};

export default AppErrorBoundary;

const styles = StyleSheet.create({
  mainCtn: {
    flex: 1,
  },
  errorInfoCtn: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  buttonCtn: {
    margin: 16,
    marginBottom: 32,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 20,
  },
  errorDesc: {
    lineHeight: 20,
    marginVertical: 8,
  },
  errorCtn: {
    borderRadius: 8,
    lineHeight: 20,
    marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
});
