import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Switch } from 'react-native-paper';
import { ThemeType } from '../../../../theme/types';

interface ReaderSheetPreferenceItemProps {
  label: string;
  value: boolean;
  onPress: () => void;
  theme: ThemeType;
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
      android_ripple={{ color: theme.rippleColor }}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: theme.textColorSecondary }]}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onPress} color={theme.colorAccent} />
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
