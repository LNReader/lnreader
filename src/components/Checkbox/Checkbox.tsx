import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {Checkbox as PaperCheckbox} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {ThemeType} from '../../theme/types';

export enum CheckboxStatus {
  Checked = 'checked',
  Unchecked = 'unchecked',
  Indeterminate = 'indeterminate',
}

export enum SortItemStatus {
  ASC = 'ascending',
  DESC = 'descending',
}

interface CheckboxProps {
  label: string;
  status: CheckboxStatus;
  onPress: () => void;
  disabled?: boolean;
  theme: ThemeType;
}

const Checkbox: React.FC<CheckboxProps> = props => {
  const {label, status, onPress, disabled, theme} = props;

  return (
    <Pressable
      android_ripple={{color: theme.rippleColor}}
      style={styles.pressable}
      onPress={onPress}
      disabled={disabled}
    >
      <PaperCheckbox
        status={status}
        onPress={onPress}
        color={theme.primary}
        uncheckedColor={theme.textColorSecondary}
        disabled={disabled}
      />
      <Text style={[{color: theme.textColorPrimary}, styles.label]}>
        {label}
      </Text>
    </Pressable>
  );
};

interface SortItemProps {
  label: string;
  status: SortItemStatus | null;
  onPress: () => void;
  theme: ThemeType;
}

export const SortItem: React.FC<SortItemProps> = ({
  label,
  status,
  onPress,
  theme,
}) => (
  <Pressable
    android_ripple={{color: theme.rippleColor}}
    style={[styles.pressable, styles.sortItem]}
    onPress={onPress}
  >
    {status && (
      <MaterialCommunityIcons
        name={status === SortItemStatus.ASC ? 'arrow-up' : 'arrow-down'}
        color={theme.primary}
        size={21}
        style={styles.icon}
      />
    )}
    <Text style={{color: theme.textColorPrimary}}>{label}</Text>
  </Pressable>
);

export default Checkbox;

const styles = StyleSheet.create({
  pressable: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 12,
  },
  sortItem: {
    paddingVertical: 16,
    paddingLeft: 64,
  },
  icon: {
    position: 'absolute',
    left: 24,
    alignSelf: 'center',
  },
});
