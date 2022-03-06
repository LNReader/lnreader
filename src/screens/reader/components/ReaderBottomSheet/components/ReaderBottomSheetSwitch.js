import React from 'react';
import PropTypes from 'prop-types';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Switch } from 'react-native-paper';

export const ReaderBottomSheetSwitch = ({ label, value, onPress, theme }) => {
  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={onPress}
    >
      <Text style={{ color: theme.textColorSecondary }}>{label}</Text>
      <Switch value={value} onValueChange={onPress} color={theme.colorAccent} />
    </Pressable>
  );
};

ReaderBottomSheetSwitch.propTypes = {
  label: PropTypes.string,
  value: PropTypes.bool,
  onPress: PropTypes.func,
  theme: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
