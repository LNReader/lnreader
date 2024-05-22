import { StatusBar } from 'react-native';
import { ThemeColors } from '@theme/types';
import * as NavigationBar from 'expo-navigation-bar';

/**
 * Sets status and navigation bar color.
 *
 * @param theme
 */

export const setBarColor = (theme: ThemeColors) =>
  StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');

export const changeNavigationBarColor = (color: string, isDark = false) => {
  NavigationBar.setBackgroundColorAsync(color);
  NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
};
