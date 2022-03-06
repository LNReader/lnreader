import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';

import { Switch, List } from 'react-native-paper';

const SwitchSetting = ({ label, description, onPress, theme, icon, value }) => (
  <Pressable
    android_ripple={{ color: theme.rippleColor }}
    style={[styles.container, { paddingVertical: description ? 16 : 12 }]}
    onPress={onPress}
  >
    <View style={{ flexDirection: 'row', flex: 1 }}>
      {icon && (
        <List.Icon
          color={theme.colorAccent}
          icon={icon}
          style={{ margin: 0 }}
        />
      )}
      <View style={[icon && { marginLeft: 16 }]}>
        <Text
          style={{
            color: theme.textColorPrimary,
            fontSize: 16,
            flex: 1,
            textAlignVertical: 'center',
          }}
        >
          {label}
        </Text>
        {description && (
          <Text style={{ color: theme.textColorSecondary }}>{description}</Text>
        )}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onPress}
      color={theme.colorAccent}
      style={{ marginLeft: 8 }}
    />
  </Pressable>
);

export default SwitchSetting;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
