import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeTypeV1 } from '../../theme/v1/theme/types';

interface ChipProps {
  label: string;
  theme: ThemeTypeV1;
}

const Chip: React.FC<ChipProps> = ({ label, theme }) => (
  <View style={[styles.chipContainer, { backgroundColor: theme.colorPrimary }]}>
    <Pressable
      android_ripple={{ color: theme.rippleColor }}
      style={styles.pressable}
    >
      <Text style={[styles.label, { color: theme.textColorSecondary }]}>
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
    height: 28,
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
