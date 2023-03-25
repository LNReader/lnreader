import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeType } from '../../theme/types';

interface ColorPreferenceItemProps {
  label: string;
  description?: string;
  onPress: () => void;
  theme: ThemeType;
}

const ColorPreferenceItem: React.FC<ColorPreferenceItemProps> = ({
  label,
  description,
  theme,
  onPress,
}) => (
  <Pressable
    style={styles.container}
    android_ripple={{ color: theme.rippleColor }}
    onPress={onPress}
  >
    <View>
      <Text style={[styles.label, { color: theme.onSurface }]}>{label}</Text>
      <Text style={{ color: theme.onSurfaceVariant }}>
        {description?.toUpperCase?.()}
      </Text>
    </View>
    <View style={[{ backgroundColor: description }, styles.colorPreview]} />
  </Pressable>
);

export default ColorPreferenceItem;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  colorPreview: {
    height: 24,
    width: 24,
    borderRadius: 50,
    marginRight: 16,
  },
});
