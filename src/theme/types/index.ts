export enum ColorScheme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface ThemeType {
  id: number;
  name: string;
  type: ColorScheme;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  inverseOnSurface: string;
  inverseSurface: string;
  primaryInverse: string;
  error: string;
  errorContainer: string;
  onError: string;
  onErrorContainer: string;
  textColorPrimary: string;
  textColorSecondary: string;
  textColorHint: string;
  rippleColor: string;
  divider: string;
}
