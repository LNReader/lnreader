import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Switch, List } from 'react-native-paper';
import { ThemeColors } from '@theme/types';

interface SwitchProps {
  label: string;
  description?: string;
  onPress: () => void;
  theme: ThemeColors;
  icon?: string;
  value: boolean;
}

const SwitchSetting: React.FC<SwitchProps> = ({
  label,
  description,
  onPress,
  theme,
  icon,
  value,
}) => {
  return (
    <Pressable
      android_ripple={{
        color: theme.rippleColor,
      }}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.row}>
        {icon && (
          <List.Icon color={theme.primary} icon={icon} style={styles.icon} />
        )}
        <View>
          <Text style={[styles.text, { color: theme.onSurface }]}>{label}</Text>
          {description && (
            <Text style={{ color: theme.onSurfaceVariant }}>{description}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onPress}
        color={theme.primary}
        style={styles.switch}
      />
    </Pressable>
  );
};

export default SwitchSetting;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  icon: {
    margin: 0,
    marginRight: 16,
  },
  text: {
    fontSize: 16,
    textAlignVertical: 'center',
  },
  switch: {
    marginLeft: 8,
  },
});
