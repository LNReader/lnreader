import React from 'react';
import { ScrollView, Text } from 'react-native';

import { ThemePicker as TP } from '@components/ThemePicker/ThemePicker';

import { ThemeColors } from '@theme/types';
import { ThemePickerSetting } from '../Settings';
import { useMMKVObject, useMMKVString } from 'react-native-mmkv';

interface ThemePicker {
  theme: ThemeColors;
  settings: ThemePickerSetting;
}

export default function SettingsThemePicker({ theme, settings }: ThemePicker) {
  const [, setTheme] = useMMKVObject('APP_THEME');
  const [, setCustomAccentColor] = useMMKVString('CUSTOM_ACCENT_COLOR');
  return (
    <>
      <Text
        style={{
          color: theme.onSurface,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        {settings.title}
      </Text>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {settings.options.map(item => (
          <TP
            key={item.id}
            currentTheme={theme}
            theme={item}
            onPress={() => {
              setTheme(item);
              setCustomAccentColor(undefined);
            }}
          />
        ))}
      </ScrollView>
    </>
  );
}
