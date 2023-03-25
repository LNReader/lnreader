import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';

import { Switch } from 'react-native-paper';
import { ThemeColors } from '../../theme/types';

interface SwitchItemProps {
  value: boolean;
  label: string;
  description?: string;
  onPress: () => void;
  theme: ThemeColors;
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
      <Text style={[{ color: theme.onSurface }, styles.label]}>{label}</Text>
      {description ? (
        <Text style={{ color: theme.onSurfaceVariant }}>{description}</Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onPress}
      color={theme.primary}
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
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
  },
  switch: {
    marginLeft: 8,
  },
});
