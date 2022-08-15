import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import color from 'color';

import { Switch } from 'react-native-paper';
import { MD3ThemeType } from '../../theme/types';

interface SwitchItemProps {
  value: boolean;
  label: string;
  description?: string;
  onPress: () => void;
  theme: MD3ThemeType;
}

const SwitchItem: React.FC<SwitchItemProps> = ({
  label,
  description,
  onPress,
  theme,
  value,
}) => (
  <Pressable
    android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
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
