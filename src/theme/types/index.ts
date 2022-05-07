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
