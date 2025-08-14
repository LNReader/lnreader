import { SwitchItem } from '@components';
import { ThemeColors } from '@theme/types';
import { StyleSheet } from 'react-native';

interface SettingSwitchProps {
  value: boolean;
  label: string;
  description?: string;
  onPress: () => void;
  theme: ThemeColors;
}

export default function SettingSwitch({
  value,
  label,
  description,
  onPress,
  theme,
}: SettingSwitchProps) {
  return (
    <SwitchItem
      value={value}
      label={label}
      description={description}
      onPress={onPress}
      theme={theme}
      style={styles.paddingHorizontal}
    />
  );
}

const styles = StyleSheet.create({
  paddingHorizontal: { paddingHorizontal: 16 },
});
