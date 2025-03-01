import React from 'react';
import { View, StyleSheet } from 'react-native';

const Row = ({
  children,
  style = {},
}: {
  children?: React.ReactNode;
  style?: any;
}) => <View style={[styles.row, style]}>{children}</View>;

export { Row };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
