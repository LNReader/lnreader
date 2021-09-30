import React from 'react';
import {View, StyleSheet} from 'react-native';

const ScreenContainer = ({children, theme}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: theme.colorPrimaryDark,
      paddingBottom: 16,
    }}
  >
    {children}
  </View>
);

const Row = ({children, style}) => (
  <View style={[styles.row, style]}>{children}</View>
);

export {ScreenContainer, Row};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
