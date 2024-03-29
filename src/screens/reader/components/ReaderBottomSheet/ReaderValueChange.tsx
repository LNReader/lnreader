import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';

import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import { IconButtonV2 } from '@components';

type ValueKey<T extends object> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

interface ReaderValueChangeProps {
  labelStyle?: TextStyle | TextStyle[];
  valueChange?: number;
  label: string;
  valueKey: ValueKey<ReturnType<typeof useChapterReaderSettings>>;
  min?: number;
  max?: number;
}

const ReaderValueChange: React.FC<ReaderValueChangeProps> = ({
  labelStyle,
  label,
  valueChange = 0.1,
  valueKey,
  min = 1.3,
  max = 2,
}) => {
  const theme = useTheme();
  const { setChapterReaderSettings, ...settings } = useChapterReaderSettings();

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
              [valueKey]: settings[valueKey] - valueChange,
            })
          }
          theme={theme}
        />
        <Text style={[styles.value, { color: theme.onSurface }]}>
          {`${Math.round(settings[valueKey] * 10) / 10}%`}
        </Text>
        <IconButtonV2
          name="plus"
          color={theme.primary}
          size={26}
          disabled={settings[valueKey] >= max}
          onPress={() =>
            setChapterReaderSettings({
              [valueKey]: settings[valueKey] + valueChange,
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  value: {
    paddingHorizontal: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
