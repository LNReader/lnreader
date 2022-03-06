import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenContainer = ({ children, theme }) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colorPrimaryDark,
        paddingBottom: bottom,
      }}
    >
      {children}
    </View>
  );
};

const Row = ({ children, style }) => (
  <View style={[styles.row, style]}>{children}</View>
);

export { ScreenContainer, Row };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
