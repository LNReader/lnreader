import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Checkbox as PaperCheckbox } from 'react-native-paper';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const Checkbox = ({ label, status, onPress, disabled, theme }) => (
  <Pressable
    android_ripple={{ color: theme.rippleColor }}
    style={styles.pressable}
    onPress={onPress}
    disabled={disabled}
  >
    <PaperCheckbox
      status={
        status === 'indeterminate'
          ? 'indeterminate'
          : status
          ? 'checked'
          : 'unchecked'
      }
      onPress={onPress}
      color={theme.colorAccent}
      uncheckedColor={theme.textColorSecondary}
      disabled={disabled}
    />
    <Text style={{ color: theme.textColorPrimary, marginLeft: 12 }}>
      {label}
    </Text>
  </Pressable>
);

export const SortItem = ({ label, status, onPress, theme }) => (
  <Pressable
    android_ripple={{ color: theme.rippleColor }}
    style={[styles.pressable, { paddingVertical: 16, paddingLeft: 64 }]}
    onPress={onPress}
  >
    {status && (
      <MaterialCommunityIcons
        name={status === 'asc' ? 'arrow-up' : 'arrow-down'}
        color={theme.colorAccent}
        size={21}
        style={styles.icon}
      />
    )}
    <Text style={{ color: theme.textColorPrimary }}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  pressable: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: 24,
    alignSelf: 'center',
  },
});
