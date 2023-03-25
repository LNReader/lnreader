import { StatusBar } from 'react-native';
import { ThemeColors } from '@theme/types';

/**
 * Sets status and navigation bar color.
 *
 * @param theme
 */

export const setBarColor = (theme: ThemeColors) =>
  StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');
