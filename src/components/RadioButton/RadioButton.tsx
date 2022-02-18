import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {RadioButton as PaperRadioButton} from 'react-native-paper';

import {ThemeType} from '../../theme/types';

interface RadioButtonProps {
  label: string;
  status: 'checked' | 'unchecked';
  value?: string;
  onPress: () => void;
  theme: ThemeType;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  status,
  value,
  onPress,
  theme,
}) => (
  <Pressable
    android_ripple={{color: theme.rippleColor}}
    style={styles.pressable}
    onPress={onPress}
  >
    <PaperRadioButton
      value={value}
      status={status}
      onPress={onPress}
      color={theme.primary}
      uncheckedColor={theme.textColorSecondary}
    />
    <Text style={[styles.label, {color: theme.textColorPrimary}]}>{label}</Text>
  </Pressable>
);

export default RadioButton;

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
});
