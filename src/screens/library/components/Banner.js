import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const Banner = ({ label, icon, backgroundColor, theme }) => (
  <View style={[{ backgroundColor }, styles.container]}>
    <MaterialCommunityIcons
      name={icon}
      color={theme.textColorPrimary}
      size={18}
    />
    <Text style={{ color: theme.textColorPrimary, marginLeft: 8 }}>
      {label}
    </Text>
  </View>
);

Banner.defaultProps = {
  backgroundColor: '#2979FF',
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
