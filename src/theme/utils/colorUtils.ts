import { ColorScheme, ThemeType } from '../types';

export const getFilterColor = (theme: ThemeType): string =>
  theme.type === ColorScheme.DARK ? '#FFEB3B' : '#FFC107';
