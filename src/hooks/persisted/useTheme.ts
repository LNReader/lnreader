import { useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import {
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVString,
} from 'react-native-mmkv';
import { overlay } from 'react-native-paper';
import Color from 'color';

import { defaultTheme } from '@theme/md3/defaultTheme';
import { ThemeColors } from '@theme/types';
import { darkThemes, lightThemes } from '@theme/md3';

const getElevationColor = (colors: ThemeColors, elevation: number): string => {
  return Color(colors.surface)
    .mix(Color(colors.primary), elevation)
    .rgb()
    .string();
};

const addComputedColors = (colors: ThemeColors): ThemeColors => ({
  ...colors,
  surface2: getElevationColor(colors, 0.08),
  overlay3: overlay(3, colors.surface),
  rippleColor: Color(colors.primary).alpha(0.12).toString(),
  surfaceReader: Color(colors.surface).alpha(0.9).toString(),
});

const applyAmoledBlack = (
  colors: ThemeColors,
  isEnabled: boolean,
): ThemeColors => {
  if (!isEnabled || !colors.isDark) {
    return colors;
  }

  return {
    ...colors,
    background: '#000000',
    surface: '#000000',
  };
};

const applyCustomAccent = (
  colors: ThemeColors,
  accentColor?: string,
): ThemeColors => {
  if (!accentColor) {
    return colors;
  }

  return {
    ...colors,
    primary: accentColor,
    secondary: accentColor,
  };
};

const findThemeById = (
  themeId: number | undefined,
  isDark: boolean,
): ThemeColors => {
  const themeList = isDark ? darkThemes : lightThemes;

  if (themeId !== undefined) {
    const theme = themeList.find(t => t.id === themeId);
    if (theme) {
      return theme;
    }
  }

  return isDark ? defaultTheme.dark : defaultTheme.light;
};

const getBaseTheme = (
  themeMode: string,
  themeId: number | undefined,
  systemColorScheme: ColorSchemeName,
): ThemeColors => {
  if (themeMode === 'system') {
    const shouldUseDarkTheme = systemColorScheme === 'dark';
    return findThemeById(themeId, shouldUseDarkTheme);
  }

  const isDark = themeMode === 'dark';

  return findThemeById(themeId, isDark);
};

export const useTheme = (): ThemeColors => {
  const [themeId] = useMMKVNumber('APP_THEME_ID');
  const [themeMode = 'system'] = useMMKVString('THEME_MODE');
  const [isAmoledBlack = false] = useMMKVBoolean('AMOLED_BLACK');
  const [customAccent] = useMMKVString('CUSTOM_ACCENT_COLOR');

  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const theme = useMemo(() => {
    const baseTheme = getBaseTheme(themeMode, themeId, systemColorScheme);
    const withAmoled = applyAmoledBlack(baseTheme, isAmoledBlack);
    const withAccent = applyCustomAccent(withAmoled, customAccent);
    const finalTheme = addComputedColors(withAccent);

    return finalTheme;
  }, [themeId, themeMode, systemColorScheme, isAmoledBlack, customAccent]);

  return theme;
};
