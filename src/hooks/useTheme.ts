import { useMMKVBoolean, useMMKVObject } from 'react-native-mmkv';
import { Appearance } from 'react-native';
import { defaultTheme } from '../theme/md3/defaultTheme';
import { MD3ThemeType } from '../theme/types';
import { useMemo } from 'react';

export const useTheme = (): MD3ThemeType => {
  const [appTheme] = useMMKVObject<MD3ThemeType>('APP_THEME');
  const [isAmoledBlack] = useMMKVBoolean('AMOLED_BLACK');

  const theme: MD3ThemeType = useMemo(() => {
    let colors =
      appTheme ||
      ((Appearance.getColorScheme() === 'dark'
        ? defaultTheme.dark
        : defaultTheme.light) as MD3ThemeType);

    if (isAmoledBlack) {
      colors = { ...colors, background: '#000000', surface: '#000000' };
    }

    return colors;
  }, [appTheme?.id, isAmoledBlack]);

  return theme;
};
