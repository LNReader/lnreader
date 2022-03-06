import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { ThemeType } from '../../theme/types';

type Props = {
  name: string;
  color?: string;
  size?: number;
  disabled?: boolean;
  padding?: number;
  onPress?: () => void;
  theme: ThemeType;
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
      disabled={disabled}
      android_ripple={{ color: theme.rippleColor }}
    >
      <MaterialCommunityIcons
        name={name}
        size={size}
        color={disabled ? theme.textColorHint : color || theme.primary}
      />
    </Pressable>
  </View>
);

export default IconButton;

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  pressable: {
    padding: 8,
  },
});
