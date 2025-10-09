import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { ThemePicker as TP } from '@components/ThemePicker/ThemePicker';

import { ThemeColors } from '@theme/types';
import { ThemePickerSetting } from '../Settings';
import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from 'react-native-mmkv';
import SettingSwitch from './SettingSwitch';
import { getString } from '@strings/translations';

interface ThemePicker {
  theme: ThemeColors;
  settings: ThemePickerSetting;
}

export default function SettingsThemePicker({ theme, settings }: ThemePicker) {
  const [, setTheme] = useMMKVObject('APP_THEME');
  const [, setCustomAccentColor] = useMMKVString('CUSTOM_ACCENT_COLOR');
  const [isAmoledBlack = false, setAmoledBlack] =
    useMMKVBoolean('AMOLED_BLACK');

  return (
    <>
      <Text
        style={[
          {
            color: theme.onSurface,
          },
          styles.padding,
        ]}
      >
        {settings.title}
      </Text>
      <ScrollView
        contentContainerStyle={[styles.row, styles.padding]}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {settings.options.map(item => (
          <TP
            horizontal
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
      {theme.isDark && settings.options[0].isDark ? (
        <SettingSwitch
          label={getString('appearanceScreen.pureBlackDarkMode')}
          value={isAmoledBlack}
          onPress={() => setAmoledBlack(prevVal => !prevVal)}
          theme={theme}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  padding: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
