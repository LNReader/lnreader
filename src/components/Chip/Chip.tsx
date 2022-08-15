import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import color from 'color';

import { MD3ThemeType } from '../../theme/types';
import { overlay } from 'react-native-paper';

interface ChipProps {
  label: string;
  theme: MD3ThemeType;
}

const Chip: React.FC<ChipProps> = ({ label, theme }) => (
  <View
    style={[
      styles.chipContainer,
      {
        backgroundColor: theme.isDark
          ? overlay(1, theme.surface)
          : theme.secondaryContainer,
      },
    ]}
  >
    <Pressable
      android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
      style={styles.pressable}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.isDark ? theme.onSurface : theme.onSecondaryContainer,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  </View>
);

export default Chip;

const styles = StyleSheet.create({
  chipContainer: {
    overflow: 'hidden',
    borderRadius: 8,
    height: 32,
    marginRight: 8,
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
  },
});
