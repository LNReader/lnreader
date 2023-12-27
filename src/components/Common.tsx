import { ThemeColors } from '@theme/types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenContainer = ({
  children,
}: {
  children?: React.ReactNode;
  theme: ThemeColors;
}) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: bottom,
      }}
    >
      {children}
    </View>
  );
};

const Row = ({
  children,
  style = {},
}: {
  children?: React.ReactNode;
  style?: any;
}) => <View style={[styles.row, style]}>{children}</View>;

export { ScreenContainer, Row };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
