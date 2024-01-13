import { useMemo } from 'react';
import { Appearance } from 'react-native';
import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from 'react-native-mmkv';
import { overlay } from 'react-native-paper';
import Color from 'color';

import { defaultTheme } from '@theme/md3/defaultTheme';
import { ThemeColors } from '@theme/types';

const getElevationColor = (colors: ThemeColors, elevation: number) => {
  return Color(colors.surface)
    .mix(Color(colors.primary), elevation)
    .rgb()
    .string();
};

export const useTheme = (): ThemeColors => {
  const [appTheme] = useMMKVObject<ThemeColors>('APP_THEME');
  const [isAmoledBlack] = useMMKVBoolean('AMOLED_BLACK');
  const [customAccent] = useMMKVString('CUSTOM_ACCENT_COLOR');

  const theme: ThemeColors = useMemo(() => {
    const isDeviveColorSchemeDark = Appearance.getColorScheme() === 'dark';

    let colors: ThemeColors =
      appTheme ||
      (isDeviveColorSchemeDark ? defaultTheme.dark : defaultTheme.light);

    if (isAmoledBlack && colors.isDark) {
      colors = {
        ...colors,
        background: '#000000',
        surface: '#000000',
      };
    }

    if (customAccent) {
      colors = {
        ...colors,
        primary: customAccent,
        secondary: customAccent,
      };
    }

    colors = {
      ...colors,
      surface2: getElevationColor(colors, 0.08),
      overlay3: overlay(3, colors.surface),
      rippleColor: Color(colors.primary).alpha(0.12).toString(),
      surfaceReader: Color(colors.surface).alpha(0.9).toString(),
    };

    return colors;
  }, [appTheme?.id, isAmoledBlack, customAccent]);

  return theme;
};
