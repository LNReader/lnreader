import color from 'color';
import { overlay } from 'react-native-paper';
import { MD3ThemeType } from './types';

export const coverPlaceholderColor = '#8888881F';

export const dividerColor: (isDark: boolean) => string = isDark =>
  color(isDark ? '#FFFFFF' : '#000000')
    .alpha(0.12)
    .string();

export const filterColor: (isDark: boolean) => string = isDark =>
  isDark ? '#FFC107' : '#FFC107';

export const getRippleColor = (primaryColor: string) =>
  color(primaryColor).alpha(0.12).string();

export const getDialogBackground = (theme: MD3ThemeType) =>
  overlay(2, theme.surface);
