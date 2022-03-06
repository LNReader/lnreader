import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Switch } from 'react-native-paper';

import { ThemeType } from '../../../../theme/types';

interface Props {
  label: string;
  value: boolean;
  onPress: () => void;
  theme: ThemeType;
}

const ReaderBottomSheetSwitch: React.FC<Props> = ({
  label,
  value,
  onPress,
  theme,
}) => {
  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={onPress}
    >
      <Text style={{ color: theme.onSurface }}>{label}</Text>
      <Switch value={value} onValueChange={onPress} color={theme.primary} />
    </Pressable>
  );
};

export default ReaderBottomSheetSwitch;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
