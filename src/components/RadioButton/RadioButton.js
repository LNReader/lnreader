import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {RadioButton as PaperRadioButton} from 'react-native-paper';

export const RadioButton = ({label, status, onPress, theme}) => (
  <Pressable
    android_ripple={{color: theme.rippleColor}}
    style={styles.pressable}
    onPress={onPress}
  >
    <PaperRadioButton
      status={status ? 'checked' : 'unchecked'}
      onPress={onPress}
      color={theme.colorAccent}
      uncheckedColor={theme.textColorSecondary}
    />
    <Text style={{color: theme.textColorPrimary, marginLeft: 12}}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  pressable: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: 24,
    alignSelf: 'center',
  },
});
