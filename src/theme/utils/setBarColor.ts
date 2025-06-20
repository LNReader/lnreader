import { ThemeColors } from '@theme/types';
import { SystemBars } from 'react-native-edge-to-edge';
import Color, { ColorInstance } from 'color';

export const setStatusBarColor = (color: ThemeColors | ColorInstance) => {
  if (color instanceof Color) {
    // fullscreen reader mode
    SystemBars.setStyle({ statusBar: color.isDark() ? 'light' : 'dark' });
  } else {
    SystemBars.setStyle({ statusBar: color.isDark ? 'light' : 'dark' });
  }
};

export const changeNavigationBarColor = (color: string, isDark = false) => {
  SystemBars.setStyle({ navigationBar: isDark ? 'light' : 'dark' });
};
