import React, { Suspense } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../../../theme/types';
import Switch from '@components/Switch/Switch';

interface ReaderSheetPreferenceItemProps {
  label: string;
  value: boolean;
  onPress: () => void;
  theme: ThemeColors;
}

const ReaderSheetPreferenceItem: React.FC<ReaderSheetPreferenceItemProps> = ({
  label,
  value,
  onPress,
  theme,
}) => {
  const size = 20;
  return (
    <Pressable
      style={styles.container}
      android_ripple={{ color: theme.rippleColor }}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
        {label}
      </Text>
      <Suspense
        fallback={
          <View
            style={{
              width: size * 2 + size / 6,
              height: size + size / 3,
              borderRadius: size,
            }}
          />
        }
      >
        <Switch value={value} onValueChange={onPress} size={size} />
      </Suspense>
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
