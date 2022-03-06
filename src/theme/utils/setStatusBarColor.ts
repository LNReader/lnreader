import { StatusBar } from 'react-native';
import { ColorScheme, ThemeType } from '../types';

export const setStatusBarColor = (theme: ThemeType) =>
  StatusBar.setBarStyle(
    theme.type === ColorScheme.DARK ? 'light-content' : 'dark-content',
  );
