import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import Color from 'color';

import { ThemeColors } from '../../theme/types';
import { MaterialDesignIconName } from '@type/icon';

type Props = {
  name: MaterialDesignIconName;
  color?: string;
  size?: number;
  disabled?: boolean | 'visible';
  padding?: number;
  onPress?: () => void;
  theme: ThemeColors;
  style?: ViewStyle;
};

const IconButton: React.FC<Props> = ({
  name,
  color,
  size = 24,
  padding = 8,
  onPress,
  disabled,
  theme,
  style,
}) => (
  <View style={[styles.container, style]}>
    <Pressable
      style={[styles.pressable, { padding }]}
      onPress={onPress}
      disabled={(disabled === true)}
      android_ripple={
        onPress
          ? { color: Color(theme.primary).alpha(0.12).string() }
          : undefined
      }
    >
      <MaterialCommunityIcons
        name={name}
        size={size}
        color={disabled !== false ? theme.outline : color || theme.onSurface}
      />
    </Pressable>
  </View>
);

export default React.memo(IconButton);

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  pressable: {
    padding: 8,
  },
});
