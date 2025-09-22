import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';

import {
  SettingsContextType,
  useSettingsContext,
} from '@components/Context/SettingsContext';
import { useTheme } from '@providers/Providers';
import { IconButtonV2 } from '@components';

type ValueKey<T extends object> = Exclude<
  {
    [K in keyof T]: T[K] extends number ? K : never;
  }[keyof T],
  undefined
>;

interface ReaderValueChangeProps {
  labelStyle?: TextStyle | TextStyle[];
  valueChange?: number;
  label: string;
  valueKey: ValueKey<SettingsContextType>;
  decimals?: number;
  min?: number;
  max?: number;
  unit?: string;
}

const ReaderValueChange: React.FC<ReaderValueChangeProps> = ({
  labelStyle,
  label,
  valueChange = 0.1,
  valueKey,
  decimals = 1,
  min = 1.3,
  max = 2,
  unit = '%',
}) => {
  const theme = useTheme();
  const { setSettings: setChapterReaderSettings, ...settings } =
    useSettingsContext();

  return (
    <View style={styles.container}>
      <Text style={[{ color: theme.onSurfaceVariant }, labelStyle]}>
        {label}
      </Text>
      <View style={styles.buttonContainer}>
        <IconButtonV2
          name="minus"
          color={theme.primary}
          size={26}
          disabled={settings[valueKey] <= min}
          onPress={() =>
            setChapterReaderSettings({
              [valueKey]: Math.max(min, settings[valueKey] - valueChange),
            })
          }
          theme={theme}
        />
        <Text style={[styles.value, { color: theme.onSurface }]}>
          {`${((settings[valueKey] * 10) / 10).toFixed(decimals)}${unit}`}
        </Text>
        <IconButtonV2
          name="plus"
          color={theme.primary}
          size={26}
          disabled={settings[valueKey] >= max}
          onPress={() =>
            setChapterReaderSettings({
              [valueKey]: Math.min(max, settings[valueKey] + valueChange),
            })
          }
          theme={theme}
        />
      </View>
    </View>
  );
};

export default ReaderValueChange;

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  value: {
    paddingHorizontal: 4,
    textAlign: 'center',
    width: 60,
  },
});
