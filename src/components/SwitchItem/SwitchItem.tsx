import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';

import { Switch } from 'react-native-paper';
import { ThemeType } from '../../theme/types';

interface SwitchItemProps {
  value: boolean;
  label: string;
  description?: string;
  onPress: () => void;
  theme: ThemeType;
}

const SwitchItem: React.FC<SwitchItemProps> = ({
  label,
  description,
  onPress,
  theme,
  value,
}) => (
  <Pressable
    android_ripple={{ color: theme.rippleColor }}
    style={[styles.container]}
    onPress={onPress}
  >
    <View style={styles.labelContainer}>
      <Text style={[{ color: theme.textColorPrimary }, styles.label]}>
        {label}
      </Text>
      {description ? (
        <Text style={{ color: theme.textColorSecondary }}>{description}</Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onPress}
      color={theme.colorAccent}
      style={styles.switch}
    />
  </Pressable>
);

export default SwitchItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    textAlignVertical: 'center',
  },
  switch: {
    marginLeft: 8,
  },
});
