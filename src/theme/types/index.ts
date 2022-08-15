export enum StatusbarStyle {
  LIGHT = 'light-content',
  DARK = 'dark-content',
}

export interface ThemeType {
  id: number;
  name: string;
  colorPrimaryDark: string;
  colorPrimary: string;
  colorAccent: string;
  rippleColor: string;
  searchBarColor: string;
  menuColor: string;
  dividerColor: string;
  filterColor: string;
  colorDisabled: string;
  colorButtonText: string;
  textColorPrimary: string;
  textColorSecondary: string;
  textColorHint: string;
  statusBar: StatusbarStyle;
}

export interface MD3ThemeType {
  id: number;
  name: string;
  isDark: boolean;
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
  inverseSurface: string;
  inverseOnSurface: string;
  primaryInverse: string;
  elevationOverlay: string;
  textColorPrimary: string;
  textColorSecondary: string;
  textColorHint: string;
}
