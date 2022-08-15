import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from 'react-native-mmkv';
import { Appearance } from 'react-native';
import { defaultTheme } from '../theme/md3/defaultTheme';
import { MD3ThemeType } from '../theme/types';
import { useMemo } from 'react';

export const useTheme = (): MD3ThemeType => {
  const [appTheme] = useMMKVObject<MD3ThemeType>('APP_THEME');
  const [isAmoledBlack] = useMMKVBoolean('AMOLED_BLACK');
  const [customAccent] = useMMKVString('CUSTOM_ACCENT_COLOR');

  const theme: MD3ThemeType = useMemo(() => {
    let colors =
      appTheme ||
      ((Appearance.getColorScheme() === 'dark'
        ? defaultTheme.dark
        : defaultTheme.light) as MD3ThemeType);

    if (isAmoledBlack && colors.isDark) {
      colors = { ...colors, background: '#000000', surface: '#000000' };
    }

    if (customAccent) {
      colors = { ...colors, primary: customAccent, secondary: customAccent };
    }

    return colors;
  }, [appTheme?.id, isAmoledBlack, customAccent]);

  return theme;
};
