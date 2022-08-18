import { StatusBar } from 'react-native';
import { MD3ThemeType } from '@theme/types';

/**
 * Sets status and navigation bar color.
 *
 * @param theme
 */

export const setBarColor = (theme: MD3ThemeType) =>
  StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');
