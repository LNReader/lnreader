import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import color from 'color';
import { Switch } from 'react-native-paper';
import { MD3ThemeType } from '../../../../theme/types';

interface ReaderSheetPreferenceItemProps {
  label: string;
  value: boolean;
  onPress: () => void;
  theme: MD3ThemeType;
}

const ReaderSheetPreferenceItem: React.FC<ReaderSheetPreferenceItemProps> = ({
  label,
  value,
  onPress,
  theme,
}) => {
  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: theme.textColorSecondary }]}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onPress} color={theme.primary} />
    </Pressable>
  );
};

export default ReaderSheetPreferenceItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    paddingRight: 16,
  },
});
