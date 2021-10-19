import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {RadioButton as MaterialRadioButton} from 'react-native-paper';

export const RadioButtonGroup = ({children, value, onValueChange}) => (
  <MaterialRadioButton.Group onValueChange={onValueChange} value={value}>
    {children}
  </MaterialRadioButton.Group>
);

export const RadioButton = ({value, label, theme, labelStyle}) => (
  <View style={styles.radioButtonContainer}>
    <MaterialRadioButton
      value={value}
      color={theme.colorAccent}
      uncheckedColor={theme.textColorSecondary}
    />
    <Text
      style={[
        styles.radioButtonLabel,
        {color: theme.textColorPrimary},
        labelStyle,
      ]}
    >
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButtonLabel: {
    marginLeft: 16,
    fontSize: 16,
  },
});
