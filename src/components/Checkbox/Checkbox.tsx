import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Checkbox as PaperCheckbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import color from 'color';

import { MD3ThemeType } from '../../theme/types';

interface CheckboxProps {
  label: string;
  status: boolean | 'indeterminate';
  onPress?: () => void;
  disabled?: boolean;
  theme: MD3ThemeType;
  viewStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  status,
  theme,
  disabled,
  onPress,
  viewStyle,
  labelStyle,
}) => (
  <Pressable
    android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
    style={[styles.pressable, viewStyle]}
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
      color={theme.primary}
      theme={{
        colors: { disabled: theme.textColorSecondary },
      }}
      uncheckedColor={theme.textColorSecondary}
      disabled={disabled}
    />
    <Text style={[styles.defaultLabel, { color: theme.onSurface }, labelStyle]}>
      {label}
    </Text>
  </Pressable>
);

export const SortItem = ({ label, status, onPress, theme }) => (
  <Pressable
    android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
    style={[styles.pressable, { paddingVertical: 16, paddingLeft: 64 }]}
    onPress={onPress}
  >
    {status && (
      <MaterialCommunityIcons
        name={status === 'asc' ? 'arrow-up' : 'arrow-down'}
        color={theme.primary}
        size={21}
        style={styles.icon}
      />
    )}
    <Text style={{ color: theme.onSurface }}>{label}</Text>
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
  defaultLabel: {
    marginLeft: 12,
  },
});
